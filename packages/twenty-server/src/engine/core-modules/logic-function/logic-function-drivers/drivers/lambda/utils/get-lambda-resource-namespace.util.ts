import { createHash } from 'crypto';

const RESOURCE_NAMESPACE_LENGTH = 10;

// Shared Lambda resources (builder, yarn-install, common layer, deps layer) are
// named from a content hash only, so every Twenty instance on the same version
// in one AWS account+region computes the exact same name and silently reuses
// whichever instance created it first — inheriting that instance's execution
// role. When that role is later deleted or belongs to another account, invokes
// fail with "The role defined for the function cannot be assumed by Lambda".
// Keying the namespace on the role ARN makes the sharing boundary explicit:
// instances sharing a role still dedupe, instances with different roles stay
// isolated, and a role change transparently recreates resources under a new name.
export const getLambdaResourceNamespace = (lambdaRole: string): string =>
  createHash('sha256')
    .update(lambdaRole)
    .digest('hex')
    .slice(0, RESOURCE_NAMESPACE_LENGTH);
