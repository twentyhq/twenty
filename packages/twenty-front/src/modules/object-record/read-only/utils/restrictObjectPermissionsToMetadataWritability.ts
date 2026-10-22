import { isMetadataWritabilityRestricted } from '@/object-record/read-only/utils/internal/isMetadataWritabilityRestricted';
import { type ObjectPermissions } from 'twenty-shared/types';
import { type MetadataWritability } from '~/generated-metadata/graphql';

type RestrictObjectPermissionsToMetadataWritabilityParams<
  TObjectPermissions extends ObjectPermissions,
> = {
  objectPermissions: TObjectPermissions;
  writability: MetadataWritability | null | undefined;
};

export const restrictObjectPermissionsToMetadataWritability = <
  TObjectPermissions extends ObjectPermissions,
>({
  objectPermissions,
  writability,
}: RestrictObjectPermissionsToMetadataWritabilityParams<TObjectPermissions>): TObjectPermissions => {
  if (!isMetadataWritabilityRestricted(writability)) {
    return objectPermissions;
  }

  return {
    ...objectPermissions,
    canUpdateObjectRecords: false,
    canSoftDeleteObjectRecords: false,
    canDestroyObjectRecords: false,
  };
};
