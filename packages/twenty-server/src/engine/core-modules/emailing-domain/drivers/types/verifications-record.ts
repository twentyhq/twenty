export type VerificationRecord = {
  type: 'TXT' | 'CNAME' | 'MX';
  key: string;
  value: string;
  priority?: number;
};
