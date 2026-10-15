import { isDefined } from 'twenty-shared/utils';

import { TARGET_ENVIRONMENT_VARIABLE } from '@/target/constants/target-environment-variable.constant';
import { type ResolvedTarget } from '@/target/types/resolved-target.type';

export const getAuthenticationHint = (target: ResolvedTarget) => {
  if (!isDefined(target.remoteName)) {
    return `Check ${TARGET_ENVIRONMENT_VARIABLE.API_KEY}.`;
  }

  const withTokenFlag =
    target.credentialKind === 'apiKey' ? ' --with-token' : '';

  return `Sign in again: twenty auth login --remote ${target.remoteName}${withTokenFlag}`;
};
