import {
  type ApplicationOAuthClient,
  type Manifest,
  validateApplicationOAuthClient,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

// A registry manifest is written by its publisher, so the declaration is checked again before it is shown or matched
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
