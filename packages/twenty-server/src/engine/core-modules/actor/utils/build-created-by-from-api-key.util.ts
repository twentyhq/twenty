import { type ApiKey } from 'src/engine/core-modules/api-key/api-key.entity';
import {
  type ActorMetadata,
  FieldActorSource,
} from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';

type BuildCreatedByFromApiKeyArgs = {
  apiKey: ApiKey;
};
export const buildCreatedByFromApiKey = ({
  apiKey,
}: BuildCreatedByFromApiKeyArgs): ActorMetadata => {
  // Extract the name to avoid any reference issues with TypeORM entity caching
  const apiKeyName = String(apiKey.name);

  return {
    source: FieldActorSource.API,
    name: apiKeyName,
    workspaceMemberId: null,
    context: {},
  };
};
