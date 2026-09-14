import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getRecordCreationCommandType = ({
  objectNameSingular,
  creationTargetObjectMetadataId,
  isWorkflowCoreIndexPageEnabled,
  contextObjectMetadataId,
  recordIndexId,
}: {
  objectNameSingular: string;
  contextObjectMetadataId?: string | null;
  recordIndexId?: string | null;
  creationTargetObjectMetadataId?: string | null;
  isWorkflowCoreIndexPageEnabled: boolean;
}): 'workflow' | 'global' | 'index' => {
  if (
    isWorkflowCoreIndexPageEnabled &&
    objectNameSingular === CoreObjectNameSingular.Workflow
  ) {
    return 'workflow';
  }

  if (!isDefined(creationTargetObjectMetadataId)) {
    return 'index';
  }

  return creationTargetObjectMetadataId === contextObjectMetadataId &&
    isDefined(recordIndexId)
    ? 'index'
    : 'global';
};
