
  import {
    ActorMetadata,
    FieldActorSource,
} from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { ApiKeyWorkspaceEntity } from 'src/modules/api-key/standard-objects/api-key.workspace-entity';
  
  type BuildCreatedByFromApiKey = {
    apiKey: ApiKeyWorkspaceEntity;
  };
  export const buildCreatedByFromApiKey = ({
    apiKey,
  }: BuildCreatedByFromApiKey): ActorMetadata => ({
    source: FieldActorSource.API,
    name: apiKey.name,
    workspaceMemberId: null,
    context: {},
  });
  