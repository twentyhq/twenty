import { type ResendDomainRecord } from 'src/engine/core-modules/emailing-domain/drivers/resend/types/resend-domain-record.type';

export type ResendDomain = {
  id: string;
  name: string;
  status: string;
  region?: string;
  records?: ResendDomainRecord[];
};
