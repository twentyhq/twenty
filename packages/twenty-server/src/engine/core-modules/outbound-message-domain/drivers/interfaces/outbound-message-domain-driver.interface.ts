import { type OutboundMessageDomain } from 'src/engine/core-modules/outbound-message-domain/outbound-message-domain.entity';

export interface OutboundMessageDomainDriverInterface {
  verifyDomain(domain: OutboundMessageDomain): Promise<OutboundMessageDomain>;
  getDomainStatus(
    domain: OutboundMessageDomain,
  ): Promise<OutboundMessageDomain>;
  getDomainVerificationRecords(domain: string): Promise<string>;
}
