import { type VerificationRecordPurpose } from 'src/engine/core-modules/emailing-domain/drivers/types/verification-record-purpose.type';

export type VerificationRecord = {
  type: 'TXT' | 'CNAME' | 'MX';
  key: string;
  value: string;
  priority?: number;
  status?: string;
  purpose: VerificationRecordPurpose;
  isRequired: boolean;
};
