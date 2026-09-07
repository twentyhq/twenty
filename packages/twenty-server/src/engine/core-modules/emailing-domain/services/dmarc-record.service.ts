import { Injectable, Logger } from '@nestjs/common';

import { resolveTxt } from 'dns/promises';
import { isNonEmptyString } from '@sniptt/guards';

import { DMARC_RECORD_PREFIX } from 'src/engine/core-modules/emailing-domain/constants/dmarc-record-prefix.constant';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { buildDmarcVerificationRecord } from 'src/engine/core-modules/emailing-domain/utils/build-dmarc-verification-record.util';
import { findDmarcPolicyInTxtRecords } from 'src/engine/core-modules/emailing-domain/utils/find-dmarc-policy-in-txt-records.util';
import { getDmarcLookupDomains } from 'src/engine/core-modules/emailing-domain/utils/get-dmarc-lookup-domains.util';

const MISSING_RECORD_DNS_CODES = ['ENOTFOUND', 'ENODATA'];

@Injectable()
export class DmarcRecordService {
  private readonly logger = new Logger(DmarcRecordService.name);

  async withDnsRecord(
    emailingDomain: EmailingDomainEntity,
  ): Promise<EmailingDomainEntity> {
    if (!isNonEmptyString(emailingDomain.domain)) {
      return emailingDomain;
    }

    const isPolicyMissing = await this.isPolicyMissing(emailingDomain.domain);

    if (!isPolicyMissing) {
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

  // Publishing a second record at _dmarc makes receivers discard every policy
  // for the domain (RFC 7489 6.6.3), so the record is only ever offered once a
  // lookup proves none exists. An inconclusive lookup keeps it hidden.
  private async isPolicyMissing(domain: string): Promise<boolean> {
    for (const lookupDomain of getDmarcLookupDomains(domain)) {
      const policyState = await this.findPolicyState(lookupDomain);

      if (policyState !== 'absent') {
        return false;
      }
    }

    return true;
  }

  private async findPolicyState(
    domain: string,
  ): Promise<'present' | 'absent' | 'unknown'> {
    try {
      const txtRecords = await resolveTxt(`${DMARC_RECORD_PREFIX}.${domain}`);

      return findDmarcPolicyInTxtRecords(txtRecords) ? 'present' : 'absent';
    } catch (error) {
      const code =
        error instanceof Error && 'code' in error ? String(error.code) : '';

      if (MISSING_RECORD_DNS_CODES.includes(code)) {
        return 'absent';
      }

      this.logger.warn(
        `Could not resolve the DMARC record of ${domain}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return 'unknown';
    }
  }
}
