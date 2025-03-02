import {
  EmailDriver,
  EmailModuleOptions,
} from 'src/engine/core-modules/email/interfaces/email.interface';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

export const emailModuleFactory = (
  environmentService: EnvironmentService,
): EmailModuleOptions => {
  const driver = environmentService.get('EMAIL_DRIVER');

  switch (driver) {
    case EmailDriver.Logger:
      return {};

    case EmailDriver.Smtp: {
      const host = environmentService.get('EMAIL_SMTP_HOST');
      const port = environmentService.get('EMAIL_SMTP_PORT');

      if (!host || !port) {
        throw new Error(
          `${driver} email driver requires host and port to be defined, check your .env file`,
        );
      }

      const options: EmailModuleOptions = {
        host,
        port,
        ...(environmentService.get('EMAIL_SMTP_SECURE') !== undefined && {
          secure: environmentService.get('EMAIL_SMTP_SECURE') === 'true',
        }),
        ...(environmentService.get('EMAIL_SMTP_IGNORE_TLS') !== undefined && {
          ignoreTLS: environmentService.get('EMAIL_SMTP_IGNORE_TLS') === 'true',
        }),
        ...((environmentService.get('EMAIL_SMTP_USER') &&
          environmentService.get('EMAIL_SMTP_PASSWORD')) && {
          auth: {
            user: environmentService.get('EMAIL_SMTP_USER'),
            pass: environmentService.get('EMAIL_SMTP_PASSWORD'),
          },
        }),
      };

      return options;
    }

    default:
      throw new Error(`Invalid email driver (${driver}), check your .env file`);
  }
};
