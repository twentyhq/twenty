export type ManagedHostnameRecord = {
  type: 'CNAME';
  key: string;
  value: string;
  status?: string;
};
