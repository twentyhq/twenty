import { isDefined } from 'twenty-sdk/utils';

import { type GranolaWebhookScope } from 'src/logic-functions/types/granola-api.type';
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
}: {
  client: Pick<
    ReturnType<typeof createGranolaClientOrThrow>,
    'createWebhookEndpoint'
  >;
  url: string;
  preferredScopes: GranolaWebhookScope[] | undefined;
  folderIds: string[];
}) => {
  const scopeCandidates = [
    preferredScopes,
    GRANOLA_WORKSPACE_KEY_SCOPES,
    GRANOLA_PERSONAL_KEY_SCOPES,
  ]
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
        ...(folderIds.length > 0 ? { folder_ids: folderIds } : {}),
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
