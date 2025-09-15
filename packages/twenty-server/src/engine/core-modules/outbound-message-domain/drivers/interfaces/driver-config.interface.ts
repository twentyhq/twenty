import { type OutboundMessageDomainDriver } from 'src/engine/core-modules/outbound-message-domain/drivers/types/outbound-message-domain';

export interface BaseDriverConfig {
  driver: OutboundMessageDomainDriver;
}

export interface AwsSesDriverConfig extends BaseDriverConfig {
  driver: OutboundMessageDomainDriver.AWS_SES;
  region: string;
  accountId: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
}
