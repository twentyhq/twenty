import { type EmailingDomainDriver } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-driver.type';

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

export interface ResendDriverConfig extends BaseDriverConfig {
  driver: EmailingDomainDriver.RESEND;
  domainRegion?: string;
}

export interface MailgunDriverConfig extends BaseDriverConfig {
  driver: EmailingDomainDriver.MAILGUN;
}
