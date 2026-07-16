const SHA256_FINGERPRINTED_URL_PATTERN = /\/([0-9a-f]{64})\.js$/;

export const extractComponentChecksumFromUrl = ({
  url,
}: {
  url: string;
}): string | undefined => {
  const match = url.match(SHA256_FINGERPRINTED_URL_PATTERN);

  return match?.[1];
};
