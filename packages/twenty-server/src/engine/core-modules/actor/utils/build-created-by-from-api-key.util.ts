import { type ActorMetadata, FieldActorSource } from 'twenty-shared/types';

import { type ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';

type BuildCreatedByFromApiKeyArgs = {
  apiKey: ApiKeyEntity;
};
export const buildCreatedByFromApiKey = ({
  apiKey,
}: BuildCreatedByFromApiKeyArgs): ActorMetadata => ({
  source: FieldActorSource.API,
  name: apiKey.name,
  workspaceMemberId: null,
  context: {},
});
