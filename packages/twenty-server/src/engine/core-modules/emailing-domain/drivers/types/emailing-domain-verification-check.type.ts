import { type VerificationRecord } from 'src/engine/core-modules/emailing-domain/drivers/types/verifications-record.type';

export type EmailingDomainVerificationCheck = {
  name: 'DKIM' | 'MAIL_FROM';
  records: VerificationRecord[];
};
