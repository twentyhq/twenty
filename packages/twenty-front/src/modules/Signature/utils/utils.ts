import { SignatureStatus } from '../types/Signature';

export const MapSignatureStatusToText: Record<SignatureStatus, string> = {
  [SignatureStatus.PROCESSING]: 'Processing',
  [SignatureStatus.SENT_FOR_SIGNATURE]: 'Sent for signature',
  [SignatureStatus.SIGNED]: 'Signed',
  [SignatureStatus.FAILED]: 'Failed',
};
