import { createHash } from 'crypto';

import { isNonEmptyString } from '@sniptt/guards';

const RESOURCE_NAMESPACE_LENGTH = 10;

export const getLambdaResourceNamespace = (lambdaRole: string): string => {
  if (!isNonEmptyString(lambdaRole)) {
    throw new Error(
      'LOGIC_FUNCTION_LAMBDA_ROLE is required to derive the Lambda resource namespace',
    );
  }

  return createHash('sha256')
    .update(lambdaRole)
    .digest('hex')
    .slice(0, RESOURCE_NAMESPACE_LENGTH);
};
