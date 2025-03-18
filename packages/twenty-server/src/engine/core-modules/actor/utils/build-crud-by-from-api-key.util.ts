import {
  ActorMetadata,
  FieldActorSource,
} from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { ApiKeyWorkspaceEntity } from 'src/modules/api-key/standard-objects/api-key.workspace-entity';

type BuildCrudByFromApiKeyArgs = {
  apiKey: ApiKeyWorkspaceEntity;
};
export const buildCrudByFromApiKey = ({
  apiKey,
}: BuildCrudByFromApiKeyArgs): ActorMetadata => ({
  source: FieldActorSource.API,
  name: apiKey.name,
  workspaceMemberId: null,
  context: {},
});
