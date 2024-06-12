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

import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/integrations/message-queue/utils/get-queue-token.util';
import { ExceptionHandlerService } from 'src/engine/integrations/exception-handler/exception-handler.service';
import { shouldFilterException } from 'src/engine/utils/global-exception-handler.util';

import { MessageQueueMetadataAccessor } from './message-queue-metadata.accessor';

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

    for (const wrapper of processors) {
      const { instance, metatype } = wrapper;
      const methodNames = this.metadataScanner.getAllMethodNames(instance);
      const isRequestScoped = !wrapper.isDependencyTreeStatic();
      const { queueName } =
        this.metadataAccessor.getProcessorMetadata(
          // NOTE: We are relying on `instance.constructor` to properly support
          // `useValue` and `useFactory` providers besides `useClass`.
          instance.constructor || metatype,
        ) ?? {};

      if (!queueName) {
        this.logger.error(
          `Processor ${wrapper.name} is missing queue name metadata`,
        );
        continue;
      }

      const queueToken = getQueueToken(queueName);
      const messageQueueService = this.getQueueService(queueToken);
      const processMethodNames = methodNames.filter((name) =>
        this.metadataAccessor.isProcess(instance[name]),
      );

      if (processMethodNames.length < 1) {
        this.logger.error(
          `Processor ${wrapper.name} is missing process method metadata`,
        );
        continue;
      }

      const workerOptions = this.metadataAccessor.getWorkerOptionsMetadata(
        instance.constructor,
      );

      if (!wrapper.host) {
        this.logger.error(`Processor ${wrapper.name} is missing host metadata`);
        continue;
      }

      this.handleProcessor(
        instance,
        processMethodNames,
        messageQueueService,
        wrapper.host,
        isRequestScoped,
        workerOptions,
      );
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
    instance: object,
    methodNames: string[],
    queue: MessageQueueService,
    moduleRef: Module,
    isRequestScoped: boolean,
    options?: MessageQueueWorkerOptions,
  ) {
    const processMetadataCollection = new Map(
      methodNames.map((name) => {
        const metadata = this.metadataAccessor.getProcessMetadata(
          instance[name],
        );

        return [name, metadata];
      }),
    );

    if (isRequestScoped) {
      queue.work(async (job) => {
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
          moduleRef,
          moduleRef.providers,
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
      }, options);
    } else {
      queue.work(async (job) => {
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
      }, options);
    }
  }
}
