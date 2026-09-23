import { computeSha256HexDigest, isDefined } from 'twenty-shared/utils';

const computeWebCryptoSha256HexDigest = async (
  source: string,
): Promise<string | undefined> => {
  // Guards stay inside the try block: in Firefox, accessing `crypto`
  // in an opaque-origin context throws instead of being undefined.
  try {
    if (typeof crypto === 'undefined' || !isDefined(crypto.subtle)) {
      return undefined;
    }

    const digest = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(source),
    );

    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    return undefined;
  }
};

export const computeComponentSourceChecksum = async ({
  source,
}: {
  source: string;
}): Promise<string> =>
  (await computeWebCryptoSha256HexDigest(source)) ??
  computeSha256HexDigest(source);
