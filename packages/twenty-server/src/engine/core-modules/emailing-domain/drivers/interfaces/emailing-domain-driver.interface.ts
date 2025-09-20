import { type EmailingDomain } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';

export interface EmailingDomainDriverInterface {
  verifyDomain(domain: EmailingDomain): Promise<EmailingDomain>;
  getDomainStatus(
    domain: EmailingDomain,
  ): Promise<EmailingDomain>;
}
