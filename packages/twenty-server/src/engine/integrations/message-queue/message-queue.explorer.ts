import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  DiscoveryService,
  MetadataScanner,
  ModuleRef,
  createContextId,
} from '@nestjs/core';
import { Module } from '@nestjs/core/injector/module';
import { Injector } from '@nestjs/core/injector/injector';

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

    // Group processors by queue name
    const processorGroups = processors.reduce(
      (acc, wrapper) => {
        const { instance, metatype } = wrapper;
        const methodNames = this.metadataScanner.getAllMethodNames(instance);
        const { queueName } =
          this.metadataAccessor.getProcessorMetadata(
            // NOTE: We are relying on `instance.constructor` to properly support
            // `useValue` and `useFactory` providers besides `useClass`.
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

    for (const [queueName, processors] of Object.entries(processorGroups)) {
      const queueToken = getQueueToken(queueName);
      const messageQueueService = this.getQueueService(queueToken);

      this.handleProcessor(processors, messageQueueService);
    }
  }

  getQueueService(queueToken: string): MessageQueueService {
    try {
      return this.moduleRef.get<MessageQueueService>(queueToken, {
        strict: false,
      });
    } catch (err) {
      this.logger.error(`No queue found for token ${queueToken}`);
      throw err;
    }
  }

  handleProcessor(
    processors: ProcessorGroup[],
    queue: MessageQueueService,
    options?: MessageQueueWorkerOptions,
  ) {
    queue.work(async (job) => {
      for (const processor of processors) {
        this.processJob(processor, job);
      }
    }, options);
  }

  async processJob(
    { instance, host, processMethodNames, isRequestScoped }: ProcessorGroup,
    job: MessageQueueJob<MessageQueueJobData>,
  ) {
    const processMetadataCollection = new Map(
      processMethodNames.map((name) => {
        const metadata = this.metadataAccessor.getProcessMetadata(
          instance[name],
        );

        console.log(`Metadata for method ${name}:`, metadata);

        return [name, metadata];
      }),
    );

    if (isRequestScoped) {
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

      for (const [methodName, metadata] of processMetadataCollection) {
        if (job.name === metadata?.jobName || !metadata?.jobName) {
          try {
            await contextInstance[methodName].call(contextInstance, job.data);
          } catch (err) {
            if (!shouldFilterException(err)) {
              this.exceptionHandlerService.captureExceptions([err]);
            }
            throw err;
          }
        }
      }
    } else {
      console.log('INFO: Processing job', {
        instance,
        job,
        processMetadataCollection,
        processMethodNames,
      });
      for (const [methodName, metadata] of processMetadataCollection) {
        console.log(`Checking job name ${job.name} against metadata`, metadata);
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
}
