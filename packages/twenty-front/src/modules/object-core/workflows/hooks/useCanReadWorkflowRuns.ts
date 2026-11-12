import { StandardObjectNameSingular } from 'twenty-shared/types';
import { canAccessThroughAllRecordsOrRlsPermission } from 'twenty-shared/utils';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';

export const useCanReadWorkflowRuns = () => {
  const { objectMetadataItem: workflowRunObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: StandardObjectNameSingular.WorkflowRun,
    });
  const workflowRunPermissions = useObjectPermissionsForObject(
    workflowRunObjectMetadataItem.id,
  );

  return canAccessThroughAllRecordsOrRlsPermission({
    objectRecordsPermissions: workflowRunPermissions,
    operationType: 'read',
  });
};
