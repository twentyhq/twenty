import { type MailgunDnsRecord } from 'src/engine/core-modules/emailing-domain/drivers/mailgun/types/mailgun-dns-record.type';

export type MailgunDomainResponse = {
  domain?: {
    name?: string;
    state?: string;
  };
  sending_dns_records?: MailgunDnsRecord[];
  receiving_dns_records?: MailgunDnsRecord[];
};
