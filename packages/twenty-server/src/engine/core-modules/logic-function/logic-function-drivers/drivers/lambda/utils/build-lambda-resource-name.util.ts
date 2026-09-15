import { isNonEmptyString } from '@sniptt/guards';

export const buildLambdaResourceName = ({
  resourceNamePrefix,
  namespace,
  checksum,
}: {
  resourceNamePrefix: string;
  namespace?: string;
  checksum: string;
}): string =>
  isNonEmptyString(namespace)
    ? `${resourceNamePrefix}-${namespace}-${checksum}`
    : `${resourceNamePrefix}-${checksum}`;
