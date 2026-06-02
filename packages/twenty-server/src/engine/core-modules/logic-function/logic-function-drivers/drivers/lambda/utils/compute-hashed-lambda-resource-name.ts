import { createHash } from 'crypto';

const RESOURCE_NAME_CHECKSUM_LENGTH = 12;

export const computeHashedLambdaResourceName = ({
  prefix,
  contents,
}: {
  prefix: string;
  contents: ReadonlyArray<string>;
}): string => {
  const hash = createHash('sha256');

  for (const content of contents) {
    hash.update(content);
  }

  const checksum = hash.digest('hex').slice(0, RESOURCE_NAME_CHECKSUM_LENGTH);

  return `${prefix}-${checksum}`;
};
