import { Injectable } from '@nestjs/common';

import { resolve4, resolveCname, resolveMx, resolveTxt } from 'dns/promises';
import { v4 } from 'uuid';

import { type MailFromDomainDnsRecords } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/types/mail-from-domain-dns-records.type';
import { type MailFromDomainUsage } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/types/mail-from-domain-usage.type';
import { buildAwsSesMailFromDomainCandidates } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/utils/build-aws-ses-mail-from-domain-candidates.util';
import { getMailFromDomainUsage } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/utils/get-mail-from-domain-usage.util';
import { isMissingDnsRecordError } from 'src/engine/core-modules/emailing-domain/utils/is-missing-dns-record-error.util';

@Injectable()
export class AwsSesMailFromDomainService {
  async getUsage({
    mailFromDomain,
    region,
  }: {
    mailFromDomain: string;
    region: string;
  }): Promise<MailFromDomainUsage> {
    return getMailFromDomainUsage({
      dnsRecords: await this.lookupDnsRecords(mailFromDomain),
      sesMailExchange: this.buildSesMailExchange(region),
    });
  }

  async findAvailableMailFromDomain({
    domain,
    region,
  }: {
    domain: string;
    region: string;
  }): Promise<string> {
    const [firstCandidate, ...otherCandidates] =
      buildAwsSesMailFromDomainCandidates(domain);

    const hasWildcardRecords = await this.hasAnyDnsRecord(`${v4()}.${domain}`);

    if (hasWildcardRecords) {
      return firstCandidate;
    }

    for (const candidate of [firstCandidate, ...otherCandidates]) {
      const usage = await this.getUsage({ mailFromDomain: candidate, region });

      switch (usage) {
        case 'FREE':
        case 'POINTS_TO_SES':
          return candidate;
        case 'TAKEN':
          continue;
      }
    }

    return firstCandidate;
  }

  private buildSesMailExchange(region: string): string {
    return `feedback-smtp.${region}.amazonses.com`;
  }

  private async hasAnyDnsRecord(name: string): Promise<boolean> {
    const { canonicalNames, mailExchanges, textRecords, addresses } =
      await this.lookupDnsRecords(name);

    return (
      canonicalNames.length +
        mailExchanges.length +
        textRecords.length +
        addresses.length >
      0
    );
  }

  private async lookupDnsRecords(
    name: string,
  ): Promise<MailFromDomainDnsRecords> {
    const [canonicalNames, mailExchanges, textRecords, addresses] =
      await Promise.all([
        this.resolveOrEmpty(() => resolveCname(name)),
        this.resolveOrEmpty(async () =>
          (await resolveMx(name)).map(({ exchange }) => exchange),
        ),
        this.resolveOrEmpty(async () =>
          (await resolveTxt(name)).map((chunks) => chunks.join('')),
        ),
        this.resolveOrEmpty(() => resolve4(name)),
      ]);

    return { canonicalNames, mailExchanges, textRecords, addresses };
  }

  private async resolveOrEmpty(
    lookup: () => Promise<string[]>,
  ): Promise<string[]> {
    try {
      return await lookup();
    } catch (error) {
      if (isMissingDnsRecordError(error)) {
        return [];
      }

      throw error;
    }
  }
}
