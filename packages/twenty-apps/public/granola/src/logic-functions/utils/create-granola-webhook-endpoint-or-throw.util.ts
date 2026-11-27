import { isNonEmptyArray } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type GranolaWebhookScope } from 'src/logic-functions/types/granola-api.type';
import { GranolaWebhookConfigurationError } from 'src/logic-functions/types/granola-webhook-configuration-error';
import { type createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { isGranolaScopeValidationError } from 'src/logic-functions/utils/is-granola-scope-validation-error.util';

const GRANOLA_WORKSPACE_KEY_SCOPES: GranolaWebhookScope[] = ['workspace'];
const GRANOLA_PERSONAL_KEY_SCOPES: GranolaWebhookScope[] = [
  'personal',
  'public',
];

// Granola answers a scope that does not match the key type with a 400 on `scopes`.
export const createGranolaWebhookEndpointOrThrow = async ({
  client,
  url,
  preferredScopes,
  folderIds,
  isPersonalConnection,
}: {
  client: Pick<
    ReturnType<typeof createGranolaClientOrThrow>,
    'createWebhookEndpoint'
  >;
  url: string;
  preferredScopes: GranolaWebhookScope[] | undefined;
  folderIds: string[];
  isPersonalConnection?: boolean;
}) => {
  if (isPersonalConnection && !isNonEmptyArray(folderIds)) {
    throw new GranolaWebhookConfigurationError({
      message: 'A personal Granola webhook requires selected folders.',
    });
  }

  const workspaceScopeCandidates = [
    preferredScopes,
    GRANOLA_WORKSPACE_KEY_SCOPES,
    GRANOLA_PERSONAL_KEY_SCOPES,
  ];
  const personalScopeCandidates: GranolaWebhookScope[][] = [
    GRANOLA_PERSONAL_KEY_SCOPES,
    ['personal'],
    ['public'],
  ];
  const scopesForKey = isPersonalConnection
    ? personalScopeCandidates
    : workspaceScopeCandidates;
  const scopeCandidates = scopesForKey
    .filter(isDefined)
    .filter(
      (scopes, index, candidates) =>
        candidates.findIndex(
          (candidate) => candidate.join(',') === scopes.join(','),
        ) === index,
    );

  for (const [index, scopes] of scopeCandidates.entries()) {
    try {
      return await client.createWebhookEndpoint({
        url,
        scopes,
        events: ['note.generated', 'note.access_granted', 'note.edited'],
        ...(isNonEmptyArray(folderIds) ? { folder_ids: folderIds } : {}),
      });
    } catch (error) {
      if (
        index === scopeCandidates.length - 1 ||
        !isGranolaScopeValidationError(error)
      ) {
        throw error;
      }
    }
  }

  throw new Error('Granola webhook endpoint could not be created.');
};
