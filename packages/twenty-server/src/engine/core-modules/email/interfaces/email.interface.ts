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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFactory: (...args: any[]) => EmailModuleOptions;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;
