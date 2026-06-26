import {
  type ActorMetadata,
  FieldActorSource,
  type FullNameMetadata,
} from 'twenty-shared/types';

type BuildCreatedByFromFullNameMetadataArgs = {
  workspaceMemberId: string;
  fullNameMetadata: FullNameMetadata;
  byAgent?: boolean;
};
export const buildCreatedByFromFullNameMetadata = ({
  fullNameMetadata,
  workspaceMemberId,
  byAgent = false,
}: BuildCreatedByFromFullNameMetadataArgs): ActorMetadata => ({
  workspaceMemberId,
  source: byAgent ? FieldActorSource.AGENT : FieldActorSource.MANUAL,
  name: `${fullNameMetadata.firstName} ${fullNameMetadata.lastName}`,
  context: {},
});
