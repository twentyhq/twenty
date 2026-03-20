import {
  type ActorMetadata,
  FieldActorSource,
  type FullNameMetadata,
} from 'twenty-shared/types';

type BuildCreatedByFromFullNameMetadataArgs = {
  workspaceMemberId: string;
  fullNameMetadata: FullNameMetadata;
};
export const buildCreatedByFromFullNameMetadata = ({
  fullNameMetadata,
  workspaceMemberId,
}: BuildCreatedByFromFullNameMetadataArgs): ActorMetadata => {
  const fullName =
    `${fullNameMetadata.firstName} ${fullNameMetadata.lastName}`.trim();

  return {
    workspaceMemberId,
    source: FieldActorSource.MANUAL,
    name: fullName || 'Anonymous',
    context: {},
  };
};
