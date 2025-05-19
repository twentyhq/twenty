import { DynamicModule, Global } from '@nestjs/common';

import {
  EmailDriver,
  EmailModuleAsyncOptions,
} from 'src/engine/core-modules/email/interfaces/email.interface';

import { LoggerDriver } from 'src/engine/core-modules/email/drivers/logger.driver';
import { SmtpDriver } from 'src/engine/core-modules/email/drivers/smtp.driver';
import { EmailSenderService } from 'src/engine/core-modules/email/email-sender.service';
import { EMAIL_DRIVER } from 'src/engine/core-modules/email/email.constants';
import { EmailService } from 'src/engine/core-modules/email/email.service';

@Global()
export class EmailModule {
  static forRoot(options: EmailModuleAsyncOptions): DynamicModule {
    const provider = {
      provide: EMAIL_DRIVER,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useFactory: (...args: any[]) => {
        const config = options.useFactory(...args);

        return config.type === EmailDriver.Smtp
          ? new SmtpDriver(config)
          : new LoggerDriver();
      },
      inject: options.inject || [],
    };

    return {
      module: EmailModule,
      providers: [EmailSenderService, EmailService, provider],
      exports: [EmailSenderService, EmailService],
    };
  }
}
