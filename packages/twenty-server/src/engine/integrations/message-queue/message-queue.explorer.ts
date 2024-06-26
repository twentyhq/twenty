import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  DiscoveryService,
  MetadataScanner,
  ModuleRef,
  createContextId,
} from '@nestjs/core';
import { Module } from '@nestjs/core/injector/module';
import { Injector } from '@nestjs/core/injector/injector';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';

import { MessageQueueWorkerOptions } from 'src/engine/integrations/message-queue/interfaces/message-queue-worker-options.interface';
import {
  MessageQueueJob,
  MessageQueueJobData,
} from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/integrations/message-queue/utils/get-queue-token.util';
import { ExceptionHandlerService } from 'src/engine/integrations/exception-handler/exception-handler.service';
import { shouldFilterException } from 'src/engine/utils/global-exception-handler.util';

import { MessageQueueMetadataAccessor } from './message-queue-metadata.accessor';

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
    const processMetadataCollection = new Map(
      processMethodNames.map((name) => {
        const metadata = this.metadataAccessor.getProcessMetadata(
          instance[name],
        );

        return [name, metadata];
      }),
    );

    if (isRequestScoped && job.data) {
      const contextId = createContextId();

      if (this.moduleRef.registerRequestByContextId) {
        this.moduleRef.registerRequestByContextId(
          {
            // Add workspaceId to the request object
            req: {
              workspaceId: job.data.workspaceId,
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
        processMetadataCollection,
        job,
      );
    } else {
      await this.invokeProcessMethods(instance, processMetadataCollection, job);
    }
  }

  private async invokeProcessMethods(
    instance: object,
    processMetadataCollection: Map<string, any>,
    job: MessageQueueJob<MessageQueueJobData>,
  ) {
    for (const [methodName, metadata] of processMetadataCollection) {
      if (job.name === metadata?.jobName) {
        try {
          await instance[methodName].call(instance, job.data);
        } catch (err) {
          if (!shouldFilterException(err)) {
            this.exceptionHandlerService.captureExceptions([err]);
          }
          throw err;
        }
      }
    }
  }
}
