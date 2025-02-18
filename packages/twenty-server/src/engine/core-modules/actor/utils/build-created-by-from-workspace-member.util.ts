import {
  ActorMetadata,
  FieldActorSource,
} from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { FullNameMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/full-name.composite-type';

type BuildCreatedByFromWorkspaceMember = {
  workspaceMemberId: string;
  fullNameMetadata: FullNameMetadata;
};
export const buildCreatedByFromWorkspaceMember = ({
  fullNameMetadata,
  workspaceMemberId,
}: BuildCreatedByFromWorkspaceMember): ActorMetadata => ({
  workspaceMemberId,
  source: FieldActorSource.MANUAL,
  name: `${fullNameMetadata.firstName} ${fullNameMetadata.lastName}`,
  context: {},
});
