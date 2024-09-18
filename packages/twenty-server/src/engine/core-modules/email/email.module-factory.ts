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
    case EmailDriver.Logger: {
      return;
    }
    case EmailDriver.Smtp: {
      const host = environmentService.get('EMAIL_SMTP_HOST');
      const port = environmentService.get('EMAIL_SMTP_PORT');
      const user = environmentService.get('EMAIL_SMTP_USER');
      const pass = environmentService.get('EMAIL_SMTP_PASSWORD');

      if (!(host && port)) {
        throw new Error(
          `${driver} email driver requires host: ${host} and port: ${port} to be defined, check your .env file`,
        );
      }

      const auth = user && pass ? { user, pass } : undefined;

      if (auth) {
        return { host, port, auth };
      }

      return { host, port };
    }
    default:
      throw new Error(`Invalid email driver (${driver}), check your .env file`);
  }
};
