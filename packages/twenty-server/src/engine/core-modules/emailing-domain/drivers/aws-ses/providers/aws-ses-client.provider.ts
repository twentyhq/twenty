import { Injectable } from '@nestjs/common';

import { SESClient as SESv1Client } from '@aws-sdk/client-ses';
import {
  SESv2Client as SESClient,
  type SESv2ClientConfig as SESClientConfig,
} from '@aws-sdk/client-sesv2';

import { ConfigVariablesGroup } from 'src/engine/core-modules/twenty-config/enums/config-variables-group.enum';
import { ConfigGroupHashService } from 'src/engine/core-modules/twenty-config/services/config-group-hash.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { buildAwsRequestHandlerOptions } from 'src/utils/aws-request-handler.util';

@Injectable()
export class AwsSesClientProvider {
  private sesClient: SESClient | null = null;
  private sesClientConfigHash: string | null = null;
  private sesV1Client: SESv1Client | null = null;
  private sesV1ClientConfigHash: string | null = null;

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly configGroupHashService: ConfigGroupHashService,
  ) {}

  public getSESClient(): SESClient {
    const configHash = this.configGroupHashService.computeHash(
      ConfigVariablesGroup.AWS_SES_SETTINGS,
    );

    if (!this.sesClient || this.sesClientConfigHash !== configHash) {
      this.sesClient = this.createSESClient();
      this.sesClientConfigHash = configHash;
    }

    return this.sesClient;
  }

  public getSESv1Client(): SESv1Client {
    const configHash = this.configGroupHashService.computeHash(
      ConfigVariablesGroup.AWS_SES_SETTINGS,
    );

    if (!this.sesV1Client || this.sesV1ClientConfigHash !== configHash) {
      this.sesV1Client = new SESv1Client(this.buildClientConfig());
      this.sesV1ClientConfigHash = configHash;
    }

    return this.sesV1Client;
  }

  private createSESClient(): SESClient {
    return new SESClient(this.buildClientConfig());
  }

  private buildClientConfig(): SESClientConfig {
    const config: SESClientConfig = {
      region: this.twentyConfigService.get('AWS_SES_REGION'),
      requestHandler: buildAwsRequestHandlerOptions(),
    };

    const accessKeyId = this.twentyConfigService.get('AWS_SES_ACCESS_KEY_ID');
    const secretAccessKey = this.twentyConfigService.get(
      'AWS_SES_SECRET_ACCESS_KEY',
    );
    const sessionToken = this.twentyConfigService.get('AWS_SES_SESSION_TOKEN');

    if (accessKeyId && secretAccessKey) {
      config.credentials = {
        accessKeyId,
        secretAccessKey,
        ...(sessionToken ? { sessionToken } : {}),
      };
    }

    return config;
  }
}
