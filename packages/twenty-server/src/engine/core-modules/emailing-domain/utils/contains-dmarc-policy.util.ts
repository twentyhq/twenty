import { DMARC_VERSION_TAG } from 'src/engine/core-modules/emailing-domain/constants/dmarc-version-tag.constant';

export const containsDmarcPolicy = (txtRecords: string[][]): boolean =>
  txtRecords.some((chunks) =>
    chunks
      .join('')
      .trim()
      .toLowerCase()
      .startsWith(DMARC_VERSION_TAG.toLowerCase()),
  );
