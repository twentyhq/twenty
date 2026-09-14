import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getRecordCreationCommandType = ({
  objectNameSingular,
  creationTargetObjectMetadataId,
  isWorkflowCoreIndexPageEnabled,
}: {
  objectNameSingular: string;
  creationTargetObjectMetadataId?: string | null;
  isWorkflowCoreIndexPageEnabled: boolean;
}): 'workflow' | 'global' | 'index' => {
  if (
    isWorkflowCoreIndexPageEnabled &&
    objectNameSingular === CoreObjectNameSingular.Workflow
  ) {
    return 'workflow';
  }

  return isDefined(creationTargetObjectMetadataId) ? 'global' : 'index';
};
