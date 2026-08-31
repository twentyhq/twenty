import { Injectable } from '@nestjs/common';

import { GetAccountCommand } from '@aws-sdk/client-sesv2';

import { AwsSesClientProvider } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/providers/aws-ses-client.provider';
import { type AwsSesAccountState } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/types/aws-ses-account-state.type';

@Injectable()
export class AwsSesAccountService {
  constructor(private readonly awsSesClientProvider: AwsSesClientProvider) {}

  async getAccountState(): Promise<AwsSesAccountState> {
    const account = await this.awsSesClientProvider
      .getSESClient()
      .send(new GetAccountCommand({}));

    return {
      isProductionAccessEnabled: account.ProductionAccessEnabled === true,
    };
  }
}
