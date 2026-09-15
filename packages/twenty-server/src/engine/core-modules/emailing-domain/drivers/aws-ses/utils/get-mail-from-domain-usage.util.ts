import { type MailFromDomainDnsRecords } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/types/mail-from-domain-dns-records.type';
import { type MailFromDomainUsage } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/types/mail-from-domain-usage.type';

const SES_SPF_INCLUDE = 'include:amazonses.com';

export const getMailFromDomainUsage = ({
  dnsRecords,
  sesMailExchange,
}: {
  dnsRecords: MailFromDomainDnsRecords;
  sesMailExchange: string;
}): MailFromDomainUsage => {
  const { canonicalNames, mailExchanges, textRecords, addresses } = dnsRecords;

  if (canonicalNames.length > 0 || addresses.length > 0) {
    return 'TAKEN';
  }

  const hasForeignMailExchange = mailExchanges.some(
    (mailExchange) =>
      mailExchange.toLowerCase() !== sesMailExchange.toLowerCase(),
  );

  const hasForeignTextRecord = textRecords.some(
    (textRecord) => !textRecord.includes(SES_SPF_INCLUDE),
  );

  if (hasForeignMailExchange || hasForeignTextRecord) {
    return 'TAKEN';
  }

  return mailExchanges.length > 0 || textRecords.length > 0
    ? 'POINTS_TO_SES'
    : 'FREE';
};
