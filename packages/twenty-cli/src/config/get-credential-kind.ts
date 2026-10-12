import { isNonEmptyString } from '@sniptt/guards';

import { type RemoteEntry } from '@/config/types/config-file.type';
import { type CredentialKind } from '@/target/types/credential-kind.type';

export const getCredentialKind = (
  remote: RemoteEntry,
): CredentialKind | 'none' => {
  if (isNonEmptyString(remote.twentyCLIAccessToken)) {
    return 'oauth';
  }

  return isNonEmptyString(remote.apiKey) ? 'apiKey' : 'none';
};
