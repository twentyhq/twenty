import { type ActorMetadata, FieldActorSource } from 'twenty-shared/types';

import { type FlatApiKey } from 'src/engine/core-modules/Api-key/types/flat-Api-key.type';

type BuildCreatedByFromApiKeyArgs = {
  apiKey: FlatApiKey;
};
export const buildCreatedByFromApiKey = ({
  apiKey,
}: BuildCreatedByFromApiKeyArgs): ActorMetadata => ({
  source: FieldActorSource.Api,
  name: apiKey.name,
  workspaceMemberId: null,
  context: {},
});
