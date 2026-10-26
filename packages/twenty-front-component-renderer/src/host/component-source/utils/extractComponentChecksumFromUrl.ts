const SHA256_FINGERPRINTED_URL_PATTERN = /\/([0-9a-f]{64})\.js$/;
const SHARED_DEPENDENCIES_FINGERPRINTED_URL_PATTERN =
  /\/front-component-shared-dependencies\/[^/]+\/([0-9a-f]{64})$/;

export const extractComponentChecksumFromUrl = ({
  url,
}: {
  url: string;
}): string | undefined => {
  const [, checksum] =
    url.match(SHA256_FINGERPRINTED_URL_PATTERN) ??
    url.match(SHARED_DEPENDENCIES_FINGERPRINTED_URL_PATTERN) ??
    [];

  return checksum;
};
