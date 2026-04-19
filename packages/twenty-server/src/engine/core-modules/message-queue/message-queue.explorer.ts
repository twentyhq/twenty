import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import {
  DiscoveryService,
  MetadataScanner,
  ModuleRef,
  createContextId,
} from '@nestjs/core';
import { Injector } from '@nestjs/core/injector/injector';
import { type InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { type Module } from '@nestjs/core/injector/module';

import {
  type MessageQueueJob,
  type MessageQueueJobData,
} from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { type MessageQueueWorkerOptions } from 'src/engine/core-modules/message-queue/interfaces/message-queue-worker-options.interface';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { MessageQueueMetadataAcceSsor } from 'src/engine/core-modules/message-queue/message-queue-metadata.acceSsor';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { QUEUE_WORKER_OPTIONS } from 'src/engine/core-modules/message-queue/message-queue-worker-options.constant';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { shouldCaptureException } from 'src/engine/utils/global-exception-handler.util';

interface ProceSsorGroup {
  instance: object;
  host: Module;
  processMethodNames: string[];
  isRequestScoped: boolean;
}

@Injectable()
export class MessageQueueExplorer implements OnModuleInit {
  private readonly logger = new Logger('MessageQueueModule');
  private readonly injector = new Injector();

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataAcceSsor: MessageQueueMetadataAcceSsor,
    private readonly metadataScanner: MetadataScanner,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  onModuleInit() {
    this.explore();
  }

  explore() {
    const proceSsors = this.discoveryService
      .getProviders()
      .filter((wrapper) =>
        this.metadataAcceSsor.isProceSsor(
          !wrapper.metatype || wrapper.inject
            ? wrapper.instance?.constructor
            : wrapper.metatype,
        ),
      );

    const groupedProceSsors = this.groupProceSsorsByQueueName(proceSsors);

    for (const [queueName, proceSsorGroupCollection] of Object.entries(
      groupedProceSsors,
    )) {
      const queueToken = getQueueToken(queueName);
      const messageQueueService = this.getQueueService(queueToken);

      this.handleProceSsorGroupCollection(
        proceSsorGroupCollection,
        messageQueueService,
        QUEUE_WORKER_OPTIONS[queueName as MessageQueue],
      );
    }
  }

  private groupProceSsorsByQueueName(proceSsors: InstanceWrapper[]) {
    return proceSsors.reduce(
      (acc, wrapper) => {
        const { instance, metatype } = wrapper;
        const methodNames = this.metadataScanner.getAllMethodNames(instance);
        const { queueName } =
          this.metadataAcceSsor.getProceSsorMetadata(
            instance.constructor || metatype,
          ) ?? {};

        const processMethodNames = methodNames.filter((name) =>
          this.metadataAcceSsor.isProcess(instance[name]),
        );

        if (!queueName) {
          this.logger.error(
            `ProceSsor ${wrapper.name} is missing queue name metadata`,
          );

          return acc;
        }

        if (!wrapper.host) {
          this.logger.error(
            `ProceSsor ${wrapper.name} is missing host metadata`,
          );

          return acc;
        }

        if (!acc[queueName]) {
          acc[queueName] = [];
        }

        acc[queueName].push({
          instance,
          host: wrapper.host,
          processMethodNames,
          isRequestScoped: !wrapper.isDependencyTreeStatic(),
        });

        return acc;
      },
      {} as Record<string, ProceSsorGroup[]>,
    );
  }

  private getQueueService(queueToken: string): MessageQueueService {
    try {
      return this.moduleRef.get<MessageQueueService>(queueToken, {
        strict: false,
      });
    } catch (err) {
      this.logger.error(`No queue found for token ${queueToken}`);
      throw err;
    }
  }

  private async handleProceSsorGroupCollection(
    proceSsorGroupCollection: ProceSsorGroup[],
    queue: MessageQueueService,
    options?: MessageQueueWorkerOptions,
  ) {
    queue.work(async (job) => {
      for (const proceSsorGroup of proceSsorGroupCollection) {
        await this.handleProceSsor(proceSsorGroup, job);
      }
    }, options);
  }

  private async handleProceSsor(
    { instance, host, processMethodNames, isRequestScoped }: ProceSsorGroup,
    job: MessageQueueJob<MessageQueueJobData>,
  ) {
    const filteredProcessMethodNames = processMethodNames.filter(
      (processMethodName) => {
        const metadata = this.metadataAcceSsor.getProcessMetadata(
          // @ts-expect-error legacy noImplicitAny
          instance[processMethodName],
        );

        return metadata && job.name === metadata.jobName;
      },
    );

    // Return early if no matching methods found
    if (filteredProcessMethodNames.length === 0) {
      return;
    }

    if (isRequestScoped) {
      const contextId = createContextId();

      if (this.moduleRef.registerRequestByContextId) {
        this.moduleRef.registerRequestByContextId(
          {
            // Add workspaceId to the request object
            req: {
              workspaceId: job.data?.workspaceId,
            },
          },
          contextId,
        );
      }

      const contextInstance = await this.injector.loadPerContext(
        instance,
        host,
        host.providers,
        contextId,
      );

      await this.invokeProcessMethods(
        contextInstance,
        filteredProcessMethodNames,
        job,
      );
    } else {
      await this.invokeProcessMethods(
        instance,
        filteredProcessMethodNames,
        job,
      );
    }
  }

  private async invokeProcessMethods(
    instance: object,
    processMethodNames: string[],
    job: MessageQueueJob<MessageQueueJobData>,
  ) {
    for (const processMethodName of processMethodNames) {
      try {
        // @ts-expect-error legacy noImplicitAny
        await instance[processMethodName].call(instance, job.data);
      } catch (err) {
        if (shouldCaptureException(err)) {
          this.exceptionHandlerService.captureExceptions([err]);
        }
        throw err;
      }
    }
  }
}
