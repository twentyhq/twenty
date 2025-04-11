import { FactoryProvider, ModuleMetadata } from '@nestjs/common';

import SMTPConnection from 'nodemailer/lib/smtp-connection';

export enum EmailDriver {
  Logger = 'logger',
  Smtp = 'smtp',
}

export type EmailModuleOptions =
  | (SMTPConnection.Options & {
      type: EmailDriver.Smtp;
    })
  | {
      type: EmailDriver.Logger;
    };

export type EmailModuleAsyncOptions = {
  useFactory: (...args: any[]) => EmailModuleOptions;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;
