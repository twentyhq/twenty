import { isDefined } from 'twenty-shared/utils';

export const getRecordCreationCommandType = ({
  creationTargetObjectMetadataId,
  contextObjectMetadataId,
  recordIndexId,
  hasAnySoftDeleteFilterOnView = false,
}: {
  hasAnySoftDeleteFilterOnView?: boolean;
  contextObjectMetadataId?: string | null;
  recordIndexId?: string | null;
  creationTargetObjectMetadataId?: string | null;
}): 'global' | 'index' => {
  if (!isDefined(creationTargetObjectMetadataId)) {
    return 'index';
  }

  return creationTargetObjectMetadataId === contextObjectMetadataId &&
    isDefined(recordIndexId) &&
    !hasAnySoftDeleteFilterOnView
    ? 'index'
    : 'global';
};
