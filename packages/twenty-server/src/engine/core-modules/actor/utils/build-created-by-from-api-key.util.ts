import {
  ActorMetadata,
  FieldActorSource,
} from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { ApiKeyWorkspaceEntity } from 'src/modules/api-key/standard-objects/api-key.workspace-entity';

type BuildCreatedByFromApiKeyArgs = {
  apiKey: ApiKeyWorkspaceEntity;
};
export const buildCreatedByFromApiKey = ({
  apiKey,
}: BuildCreatedByFromApiKeyArgs): ActorMetadata => ({
  source: FieldActorSource.API,
  name: apiKey.name,
  workspaceMemberId: null,
  context: {},
});
