import { type EmailingDomainDriver } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain';

export interface BaseDriverConfig {
  driver: EmailingDomainDriver;
}

export interface AwsSesDriverConfig extends BaseDriverConfig {
  driver: EmailingDomainDriver.AWS_SES;
  region: string;
  accountId: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
}
