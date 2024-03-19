import { Module } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { ExceptionHandlerModule } from 'src/engine/integrations/exception-handler/exception-handler.module';
import { exceptionHandlerModuleFactory } from 'src/engine/integrations/exception-handler/exception-handler.module-factory';
import { fileStorageModuleFactory } from 'src/engine/integrations/file-storage/file-storage.module-factory';
import { loggerModuleFactory } from 'src/engine/integrations/logger/logger.module-factory';
import { messageQueueModuleFactory } from 'src/engine/integrations/message-queue/message-queue.module-factory';
import { EmailModule } from 'src/engine/integrations/email/email.module';
import { emailModuleFactory } from 'src/engine/integrations/email/email.module-factory';
import { CacheStorageModule } from 'src/engine/integrations/cache-storage/cache-storage.module';
import { CaptchaModule } from 'src/engine/integrations/captcha/captcha.module';
import { captchaModuleFactory } from 'src/engine/integrations/captcha/captcha.module-factory';

import { EnvironmentModule } from './environment/environment.module';
import { EnvironmentService } from './environment/environment.service';
import { FileStorageModule } from './file-storage/file-storage.module';
import { LoggerModule } from './logger/logger.module';
import { MessageQueueModule } from './message-queue/message-queue.module';

@Module({
  imports: [
    EnvironmentModule.forRoot({}),
    FileStorageModule.forRootAsync({
      useFactory: fileStorageModuleFactory,
      inject: [EnvironmentService],
    }),
    LoggerModule.forRootAsync({
      useFactory: loggerModuleFactory,
      inject: [EnvironmentService],
    }),
    MessageQueueModule.forRoot({
      useFactory: messageQueueModuleFactory,
      inject: [EnvironmentService],
    }),
    ExceptionHandlerModule.forRootAsync({
      useFactory: exceptionHandlerModuleFactory,
      inject: [EnvironmentService, HttpAdapterHost],
    }),
    EmailModule.forRoot({
      useFactory: emailModuleFactory,
      inject: [EnvironmentService],
    }),
    CaptchaModule.forRoot({
      useFactory: captchaModuleFactory,
      inject: [EnvironmentService],
    }),
    EventEmitterModule.forRoot({
      wildcard: true,
    }),
    CacheStorageModule,
  ],
  exports: [],
  providers: [],
})
export class IntegrationsModule {}
