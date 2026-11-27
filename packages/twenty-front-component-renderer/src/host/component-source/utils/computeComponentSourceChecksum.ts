import { md5 } from '@noble/hashes/legacy';
import { bytesToHex } from '@noble/hashes/utils';
import { isDefined } from 'twenty-shared/utils';

import { LEGACY_MD5_CHECKSUM_HEX_LENGTH } from '@/host/component-source/constants/LegacyMd5ChecksumHexLength';

export const computeComponentSourceChecksum = async ({
  source,
  expectedChecksum,
}: {
  source: string;
  expectedChecksum: string;
}): Promise<string | undefined> => {
  // Guards stay inside the try block: in Firefox, accessing `crypto`
  // in an opaque-origin context throws instead of being undefined.
  try {
    const sourceBytes = new TextEncoder().encode(source);

    if (expectedChecksum.length === LEGACY_MD5_CHECKSUM_HEX_LENGTH) {
      return bytesToHex(md5(sourceBytes));
    }

    if (typeof crypto === 'undefined' || !isDefined(crypto.subtle)) {
      return undefined;
    }

    const digest = await crypto.subtle.digest('SHA-256', sourceBytes);

    return bytesToHex(new Uint8Array(digest));
  } catch {
    return undefined;
  }
};
