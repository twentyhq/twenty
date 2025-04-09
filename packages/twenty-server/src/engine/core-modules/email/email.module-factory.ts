import {
  EmailDriver,
  EmailModuleOptions,
} from 'src/engine/core-modules/email/interfaces/email.interface';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export const emailModuleFactory = (
  twentyConfigService: TwentyConfigService,
): EmailModuleOptions => {
  const driver = twentyConfigService.get('EMAIL_DRIVER');

  switch (driver) {
    case EmailDriver.Logger:
      return {
        type: EmailDriver.Logger,
      };

    case EmailDriver.Smtp: {
      const options: EmailModuleOptions = {
        type: EmailDriver.Smtp,
      };

      const host = twentyConfigService.get('EMAIL_SMTP_HOST');
      const port = twentyConfigService.get('EMAIL_SMTP_PORT');
      const user = twentyConfigService.get('EMAIL_SMTP_USER');
      const pass = twentyConfigService.get('EMAIL_SMTP_PASSWORD');
      const noTLS = twentyConfigService.get('EMAIL_SMTP_NO_TLS');

      if (!host || !port) {
        throw new Error(
          `${driver} email driver requires host and port to be defined, check your .env file`,
        );
      }

      options.host = host;
      options.port = port;

      if (user && pass) options.auth = { user, pass };

      if (noTLS) {
        options.secure = false;
        options.ignoreTLS = true;
      }

      return options;
    }

    default:
      throw new Error(`Invalid email driver (${driver}), check your .env file`);
  }
};
