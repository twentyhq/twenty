export type ExpectedDnsRecord = {
  type: 'CNAME' | 'MX' | 'TXT';
  key: string;
  value: string;
};
