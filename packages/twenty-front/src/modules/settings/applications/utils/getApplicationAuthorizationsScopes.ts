import { isDefined } from 'twenty-shared/utils';
import { type ApplicationAuthorization } from '~/generated-metadata/graphql';

export const getApplicationAuthorizationsScopes = (
  authorizations: Pick<ApplicationAuthorization, 'scopes'>[],
): { scopes: string[]; hasUnrecordedScopes: boolean } => ({
  scopes: [...new Set(authorizations.flatMap(({ scopes }) => scopes ?? []))],
  hasUnrecordedScopes: authorizations.some(({ scopes }) => !isDefined(scopes)),
});
