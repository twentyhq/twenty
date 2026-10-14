import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getRecordCreationCommandType = ({
  objectNameSingular,
  creationTargetObjectMetadataId,
  contextObjectMetadataId,
  recordIndexId,
  hasAnySoftDeleteFilterOnView = false,
}: {
  objectNameSingular: string;
  hasAnySoftDeleteFilterOnView?: boolean;
  contextObjectMetadataId?: string | null;
  recordIndexId?: string | null;
  creationTargetObjectMetadataId?: string | null;
}): 'workflow' | 'global' | 'index' => {
  if (objectNameSingular === CoreObjectNameSingular.Workflow) {
    return 'workflow';
  }

  if (!isDefined(creationTargetObjectMetadataId)) {
    return 'index';
  }

  return creationTargetObjectMetadataId === contextObjectMetadataId &&
    isDefined(recordIndexId) &&
    !hasAnySoftDeleteFilterOnView
    ? 'index'
    : 'global';
};
