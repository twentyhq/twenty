const SHA256_FINGERPRINTED_URL_PATTERN = /\/([0-9a-f]{64})(?:\.js)?$/;

export const extractComponentChecksumFromUrl = ({
  url,
}: {
  url: string;
}): string | undefined => {
  const [, checksum] = url.match(SHA256_FINGERPRINTED_URL_PATTERN) ?? [];

  return checksum;
};
