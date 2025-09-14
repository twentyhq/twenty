import { type BaseDriverConfig } from 'src/engine/core-modules/outbound-message-domain/drivers/interfaces/driver-config.interface';

import { type OutboundMessageDomain } from 'src/engine/core-modules/outbound-message-domain/outbound-message-domain.entity';

export interface OutboundMessageDomainDriverInterface<
  TConfig extends BaseDriverConfig = BaseDriverConfig,
> {
  verifyDomain(domain: OutboundMessageDomain): Promise<OutboundMessageDomain>;
  getDomainStatus(
    domain: OutboundMessageDomain,
  ): Promise<OutboundMessageDomain>;
  getDomainVerificationRecords(
    domain: string,
    config: TConfig,
  ): Promise<string>;
}
