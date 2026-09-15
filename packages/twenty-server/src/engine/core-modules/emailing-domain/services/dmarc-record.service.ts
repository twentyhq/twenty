import { Injectable, Logger } from '@nestjs/common';

import { resolveTxt } from 'dns/promises';
import { isNonEmptyString } from '@sniptt/guards';

import { DMARC_RECORD_PREFIX } from 'src/engine/core-modules/emailing-domain/constants/dmarc-record-prefix.constant';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { buildDmarcVerificationRecord } from 'src/engine/core-modules/emailing-domain/utils/build-dmarc-verification-record.util';
import { containsDmarcPolicy } from 'src/engine/core-modules/emailing-domain/utils/contains-dmarc-policy.util';
import { getDmarcLookupDomains } from 'src/engine/core-modules/emailing-domain/utils/get-dmarc-lookup-domains.util';
import { isMissingDnsRecordError } from 'src/engine/core-modules/emailing-domain/utils/is-missing-dns-record-error.util';

@Injectable()
export class DmarcRecordService {
  private readonly logger = new Logger(DmarcRecordService.name);

  async withDnsRecord(
    emailingDomain: EmailingDomainEntity,
  ): Promise<EmailingDomainEntity> {
    if (!isNonEmptyString(emailingDomain.domain)) {
      return emailingDomain;
    }

    const canOfferDmarcRecord = await this.canOfferDmarcRecord(
      emailingDomain.domain,
    );

    if (!canOfferDmarcRecord) {
      return emailingDomain;
    }

    return {
      ...emailingDomain,
      verificationRecords: [
        ...(emailingDomain.verificationRecords ?? []),
        buildDmarcVerificationRecord(emailingDomain.domain),
      ],
    };
  }

  private async canOfferDmarcRecord(domain: string): Promise<boolean> {
    for (const lookupDomain of getDmarcLookupDomains(domain)) {
      const hasResolvedWithoutPolicy =
        await this.hasResolvedWithoutPolicy(lookupDomain);

      if (!hasResolvedWithoutPolicy) {
        return false;
      }
    }

    return true;
  }

  private async hasResolvedWithoutPolicy(domain: string): Promise<boolean> {
    try {
      const txtRecords = await resolveTxt(`${DMARC_RECORD_PREFIX}.${domain}`);

      return !containsDmarcPolicy(txtRecords);
    } catch (error) {
      if (isMissingDnsRecordError(error)) {
        return true;
      }

      this.logger.warn(
        `Could not resolve the DMARC record of ${domain}, assuming a policy is already published: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return false;
    }
  }
}
