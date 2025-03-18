import {
  ActorMetadata,
  FieldActorSource,
} from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { FullNameMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/full-name.composite-type';

type BuildCruByFromFullNameMetadataArgs = {
  workspaceMemberId: string;
  fullNameMetadata: FullNameMetadata;
};
export const buildCrudByFromFullNameMetadata = ({
  fullNameMetadata,
  workspaceMemberId,
}: BuildCruByFromFullNameMetadataArgs): ActorMetadata => ({
  workspaceMemberId,
  source: FieldActorSource.MANUAL,
  name: `${fullNameMetadata.firstName} ${fullNameMetadata.lastName}`,
  context: {},
});
