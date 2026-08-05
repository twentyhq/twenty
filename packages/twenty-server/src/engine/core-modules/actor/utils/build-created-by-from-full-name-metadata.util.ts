import {
  type ActorMetadata,
  FieldActorSource,
  type FullNameMetadata,
} from 'twenty-shared/types';

type BuildCreatedByFromFullNameMetadataArgs = {
  workspaceMemberId: string;
  fullNameMetadata: FullNameMetadata;
  applicationUniversalIdentifier?: string;
  source?: FieldActorSource;
};
export const buildCreatedByFromFullNameMetadata = ({
  fullNameMetadata,
  workspaceMemberId,
  applicationUniversalIdentifier,
  source = FieldActorSource.MANUAL,
}: BuildCreatedByFromFullNameMetadataArgs): ActorMetadata => ({
  workspaceMemberId,
  applicationUniversalIdentifier: applicationUniversalIdentifier ?? null,
  source,
  name: `${fullNameMetadata.firstName} ${fullNameMetadata.lastName}`,
  context: {},
});
