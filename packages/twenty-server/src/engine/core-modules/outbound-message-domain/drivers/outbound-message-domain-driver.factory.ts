import { Injectable } from '@nestjs/common';

import { type AwsSesDriverConfig } from 'src/engine/core-modules/outbound-message-domain/drivers/interfaces/driver-config.interface';
import { type OutboundMessageDomainDriverInterface } from 'src/engine/core-modules/outbound-message-domain/drivers/interfaces/outbound-message-domain-driver.interface';

import { AwsSesClientProvider } from 'src/engine/core-modules/outbound-message-domain/drivers/aws-ses/providers/aws-ses-client.provider';
import { AwsSesDriver } from 'src/engine/core-modules/outbound-message-domain/drivers/aws-ses/services/aws-ses-driver.service';
import { AwsSesHandleErrorService } from 'src/engine/core-modules/outbound-message-domain/drivers/aws-ses/services/aws-ses-handle-error.service';
import { OutboundMessageDomainDriver } from 'src/engine/core-modules/outbound-message-domain/drivers/types/outbound-message-domain';
import { DriverFactoryBase } from 'src/engine/core-modules/twenty-config/dynamic-factory.base';
import { ConfigVariablesGroup } from 'src/engine/core-modules/twenty-config/enums/config-variables-group.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class OutboundMessageDomainDriverFactory extends DriverFactoryBase<OutboundMessageDomainDriverInterface> {
  constructor(
    twentyConfigService: TwentyConfigService,
    private readonly awsSesClientProvider: AwsSesClientProvider,
    private readonly awsSesHandleErrorService: AwsSesHandleErrorService,
  ) {
    super(twentyConfigService);
  }

  protected buildConfigKey(): string {
    const driver = OutboundMessageDomainDriver.AWS_SES;

    if (driver === OutboundMessageDomainDriver.AWS_SES) {
      const awsConfigHash = this.getConfigGroupHash(
        ConfigVariablesGroup.AWSSeSSettings,
      );

      return `aws-ses|${awsConfigHash}`;
    }

    throw new Error(`Unsupported outbound message domain driver: ${driver}`);
  }

  protected createDriver(): OutboundMessageDomainDriverInterface {
    const driver = OutboundMessageDomainDriver.AWS_SES;

    switch (driver) {
      case OutboundMessageDomainDriver.AWS_SES: {
        const region = this.twentyConfigService.get('AWS_SES_REGION');
        const accountId = this.twentyConfigService.get('AWS_SES_ACCOUNT_ID');
        const accessKeyId = this.twentyConfigService.get(
          'AWS_SES_ACCESS_KEY_ID',
        );
        const secretAccessKey = this.twentyConfigService.get(
          'AWS_SES_SECRET_ACCESS_KEY',
        );
        const sessionToken = this.twentyConfigService.get(
          'AWS_SES_SESSION_TOKEN',
        );

        const awsConfig: AwsSesDriverConfig = {
          driver: OutboundMessageDomainDriver.AWS_SES,
          region,
          accountId,
          accessKeyId,
          secretAccessKey,
          sessionToken,
        };

        return new AwsSesDriver(
          awsConfig,
          this.awsSesClientProvider,
          this.awsSesHandleErrorService,
        );
      }

      default:
        throw new Error(`Invalid outbound message domain driver: ${driver}`);
    }
  }
}
