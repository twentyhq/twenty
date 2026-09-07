import { Injectable } from '@nestjs/common';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import {
  EmailForwardingDriverException,
  EmailForwardingDriverExceptionCode,
} from 'src/engine/core-modules/email-forwarding/drivers/exceptions/email-forwarding-driver.exception';
import { GoogleEmailForwardingService } from 'src/engine/core-modules/email-forwarding/drivers/google/services/google-email-forwarding.service';
import { type EmailForwardingDriverInterface } from 'src/engine/core-modules/email-forwarding/drivers/interfaces/email-forwarding-driver.interface';
import { MicrosoftEmailForwardingService } from 'src/engine/core-modules/email-forwarding/drivers/microsoft/services/microsoft-email-forwarding.service';

@Injectable()
export class EmailForwardingDriverFactory {
  constructor(
    private readonly googleEmailForwardingService: GoogleEmailForwardingService,
    private readonly microsoftEmailForwardingService: MicrosoftEmailForwardingService,
  ) {}

  getDriver(
    provider: ConnectedAccountProvider,
  ): EmailForwardingDriverInterface {
    switch (provider) {
      case ConnectedAccountProvider.GOOGLE:
        return this.googleEmailForwardingService;
      case ConnectedAccountProvider.MICROSOFT:
        return this.microsoftEmailForwardingService;
      default:
        throw new EmailForwardingDriverException(
          `Provider ${provider} does not support email forwarding provisioning`,
          EmailForwardingDriverExceptionCode.PROVIDER_NOT_SUPPORTED,
        );
    }
  }
}
