import { Injectable } from '@nestjs/common';

import { type ConnectedAccountProvider } from 'twenty-shared/types';

import { EmailForwardingDriverFactory } from 'src/engine/core-modules/email-forwarding/drivers/email-forwarding-driver.factory';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';

// The access token is handed in by the OAuth callback and is never written anywhere:
// once the group exists the provider keeps forwarding without us, so there is nothing
// left to hold on to.
@Injectable()
export class EmailForwardingService {
  constructor(
    private readonly emailForwardingDriverFactory: EmailForwardingDriverFactory,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  async createForwardingAddress({
    workspaceId,
    provider,
    accessToken,
    sourceAddress,
    destinationAddress,
    displayName,
  }: {
    workspaceId: string;
    provider: ConnectedAccountProvider;
    accessToken: string;
    sourceAddress: string;
    destinationAddress: string;
    displayName: string;
  }): Promise<string | null> {
    const driver = this.emailForwardingDriverFactory.getDriver(provider);

    try {
      await driver.createForwardingAddress({
        sourceAddress,
        destinationAddress,
        displayName,
        accessToken,
      });

      return null;
    } catch (error) {
      this.exceptionHandlerService.captureExceptions([error], {
        additionalData: { sourceAddress, destinationAddress, provider },
        workspace: { id: workspaceId },
      });

      return error.message;
    }
  }
}
