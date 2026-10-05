import { isNonEmptyString } from '@sniptt/guards';

export const logSlackRetryDelivery = ({
  headers,
  source,
}: {
  headers: Record<string, string | undefined>;
  source: string;
}): void => {
  const retryNum = headers['x-slack-retry-num'];

  if (!isNonEmptyString(retryNum)) {
    return;
  }

  const retryReason = isNonEmptyString(headers['x-slack-retry-reason'])
    ? headers['x-slack-retry-reason']
    : 'unknown';

  console.warn(
    `[slack] ${source} retry delivery: attempt ${retryNum}, reason ${retryReason}`,
  );
};
