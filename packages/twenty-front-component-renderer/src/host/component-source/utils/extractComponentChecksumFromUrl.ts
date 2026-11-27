const FINGERPRINTED_URL_PATTERN = /\/([0-9a-f]{64}|[0-9a-f]{32})\.js$/;

export const extractComponentChecksumFromUrl = ({
  url,
}: {
  url: string;
}): string | undefined => {
  const match = url.match(FINGERPRINTED_URL_PATTERN);

  return match?.[1];
};
