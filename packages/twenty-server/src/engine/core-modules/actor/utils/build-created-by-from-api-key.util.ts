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
}: BuildCreatedByFromApiKeyArgs): ActorMetadata => ({
  source: FieldActorSource.API,
  name: apiKey.name,
  workspaceMemberId: null,
  context: {},
});
