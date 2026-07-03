import { createHash } from 'crypto';

import { isNonEmptyString } from '@sniptt/guards';

const RESOURCE_NAME_CHECKSUM_LENGTH = 12;

// `namespace` isolates shared resources per instance (see getLambdaResourceNamespace).
// It is a distinct name segment rather than mixed into the hash so the owning
// instance stays legible in the AWS console: twenty-builder-<namespace>-<checksum>.
export const computeHashedLambdaResourceName = ({
  prefix,
  namespace,
  contents,
}: {
  prefix: string;
  namespace?: string;
  contents: ReadonlyArray<string>;
}): string => {
  const hash = createHash('sha256');

  for (const content of contents) {
    hash.update(content);
  }

  const checksum = hash.digest('hex').slice(0, RESOURCE_NAME_CHECKSUM_LENGTH);

  return isNonEmptyString(namespace)
    ? `${prefix}-${namespace}-${checksum}`
    : `${prefix}-${checksum}`;
};
