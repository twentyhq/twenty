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
import { MessageQueueMetadataAccessor } from 'src/engine/core-modules/message-queue/message-queue-metadata.accessor';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { shouldCaptureException } from 'src/engine/utils/global-exception-handler.util';

interface ProcessorGroup {
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
    private readonly metadataAccessor: MessageQueueMetadataAccessor,
    private readonly metadataScanner: MetadataScanner,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  onModuleInit() {
    this.explore();
  }

  explore() {
    const processors = this.discoveryService
      .getProviders()
      .filter((wrapper) =>
        this.metadataAccessor.isProcessor(
          !wrapper.metatype || wrapper.inject
            ? wrapper.instance?.constructor
            : wrapper.metatype,
        ),
      );

    const groupedProcessors = this.groupProcessorsByQueueName(processors);

    for (const [queueName, processorGroupCollection] of Object.entries(
      groupedProcessors,
    )) {
      const queueToken = getQueueToken(queueName);
      const messageQueueService = this.getQueueService(queueToken);

      this.handleProcessorGroupCollection(
        processorGroupCollection,
        messageQueueService,
      );
    }
  }

  private groupProcessorsByQueueName(processors: InstanceWrapper[]) {
    return processors.reduce(
      (acc, wrapper) => {
        const { instance, metatype } = wrapper;
        const methodNames = this.metadataScanner.getAllMethodNames(instance);
        const { queueName } =
          this.metadataAccessor.getProcessorMetadata(
            instance.constructor || metatype,
          ) ?? {};

        const processMethodNames = methodNames.filter((name) =>
          this.metadataAccessor.isProcess(instance[name]),
        );

        if (!queueName) {
          this.logger.error(
            `Processor ${wrapper.name} is missing queue name metadata`,
          );

          return acc;
        }

        if (!wrapper.host) {
          this.logger.error(
            `Processor ${wrapper.name} is missing host metadata`,
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
      {} as Record<string, ProcessorGroup[]>,
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

  private async handleProcessorGroupCollection(
    processorGroupCollection: ProcessorGroup[],
    queue: MessageQueueService,
    options?: MessageQueueWorkerOptions,
  ) {
    queue.work(async (job) => {
      for (const processorGroup of processorGroupCollection) {
        await this.handleProcessor(processorGroup, job);
      }
    }, options);
  }

  private async handleProcessor(
    { instance, host, processMethodNames, isRequestScoped }: ProcessorGroup,
    job: MessageQueueJob<MessageQueueJobData>,
  ) {
    const filteredProcessMethodNames = processMethodNames.filter(
      (processMethodName) => {
        const metadata = this.metadataAccessor.getProcessMetadata(
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
