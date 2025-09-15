import { type VerificationRecord } from '~/generated-metadata/graphql';

export const filterDkimRecords = (
  verificationRecords: VerificationRecord[] | null | undefined,
): VerificationRecord[] => {
  if (!verificationRecords) return [];
  
  return verificationRecords.filter(
    (record) =>
      record.type === 'CNAME' && record.name.includes('_domainkey'),
  );
};

export const filterSpfRecords = (
  verificationRecords: VerificationRecord[] | null | undefined,
): VerificationRecord[] => {
  if (!verificationRecords) return [];
  
  return verificationRecords.filter(
    (record) => record.type === 'TXT' && record.name === 'send',
  );
};

export const filterDmarcRecords = (
  verificationRecords: VerificationRecord[] | null | undefined,
): VerificationRecord[] => {
  if (!verificationRecords) return [];
  
  return verificationRecords.filter(
    (record) => record.type === 'TXT' && record.name === '_dmarc',
  );
};
