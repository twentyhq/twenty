import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { logError } from '~/utils/logError';

export const useDeleteCoreWorkflows = () => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Workflow,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const { deleteManyRecords } = useDeleteManyRecords({
    objectNameSingular: CoreObjectNameSingular.Workflow,
  });

  const { enqueueErrorSnackBar } = useSnackBar();

  const [isDeletingCoreWorkflows, setIsDeletingCoreWorkflows] = useState(false);

  const canDeleteCoreWorkflows = objectPermissions.canSoftDeleteObjectRecords;

  const deleteCoreWorkflows = async (workspaceWorkflowIds: string[]) => {
    if (isDeletingCoreWorkflows || workspaceWorkflowIds.length === 0) {
      return false;
    }

    setIsDeletingCoreWorkflows(true);

    try {
      await deleteManyRecords({ recordIdsToDelete: workspaceWorkflowIds });

      return true;
    } catch (error) {
      logError(error);
      enqueueErrorSnackBar({ message: t`Failed to delete workflows` });

      return false;
    } finally {
      setIsDeletingCoreWorkflows(false);
    }
  };

  return {
    deleteCoreWorkflows,
    canDeleteCoreWorkflows,
    isDeletingCoreWorkflows,
  };
};
