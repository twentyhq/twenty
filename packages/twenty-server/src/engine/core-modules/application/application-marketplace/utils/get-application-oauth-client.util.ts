import {
  type ApplicationOAuthClient,
  type Manifest,
  validateApplicationOAuthClient,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

export const getApplicationOAuthClient = (
  manifest:
    | { application?: Pick<Manifest['application'], 'oAuthClient'> }
    | null
    | undefined,
): ApplicationOAuthClient | undefined => {
  const oAuthClient = manifest?.application?.oAuthClient;

  if (
    !isDefined(oAuthClient) ||
    validateApplicationOAuthClient(oAuthClient).length > 0
  ) {
    return undefined;
  }

  return oAuthClient;
};
