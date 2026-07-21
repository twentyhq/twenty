import { createHash } from 'crypto';

import { isNonEmptyString } from '@sniptt/guards';

const RESOURCE_NAMESPACE_LENGTH = 10;
const NO_ROLE_SENTINEL = 'no-role';

export const getLambdaResourceNamespace = ({
  lambdaRoleArn,
}: {
  lambdaRoleArn?: string;
}): string =>
  createHash('sha256')
    .update(isNonEmptyString(lambdaRoleArn) ? lambdaRoleArn : NO_ROLE_SENTINEL)
    .digest('hex')
    .slice(0, RESOURCE_NAMESPACE_LENGTH);
