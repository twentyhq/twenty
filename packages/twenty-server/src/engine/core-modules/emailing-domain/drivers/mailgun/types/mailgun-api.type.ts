export type MailgunDnsRecord = {
  record_type?: string;
  name?: string;
  value?: string;
  valid?: string;
  priority?: string | number;
};

export type MailgunDomainResponse = {
  domain?: {
    name?: string;
    state?: string;
  };
  sending_dns_records?: MailgunDnsRecord[];
  receiving_dns_records?: MailgunDnsRecord[];
};

export type MailgunSendMessageResponse = {
  id?: string;
  message?: string;
};

export type MailgunErrorBody = {
  message?: string;
  Error?: string;
};
