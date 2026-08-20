export type ResendDomainRecord = {
  record: string;
  name: string;
  type: string;
  value: string;
  status?: string;
  priority?: number;
};
