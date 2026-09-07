const DMARC_VERSION_TAG = 'v=dmarc1';

export const findDmarcPolicyInTxtRecords = (txtRecords: string[][]): boolean =>
  txtRecords.some((chunks) =>
    chunks.join('').trim().toLowerCase().startsWith(DMARC_VERSION_TAG),
  );
