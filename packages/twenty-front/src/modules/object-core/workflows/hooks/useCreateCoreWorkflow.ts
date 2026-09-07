import { t } from '@lingui/core/macro';
import { useCallback, useState } from 'react';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useBuildRecordInputFromRLSPredicates } from '@/object-record/hooks/useBuildRecordInputFromRLSPredicates';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { canCreateRecordsForObjectMetadataItem } from '@/object-record/utils/canCreateRecordsForObjectMetadataItem';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { logError } from '~/utils/logError';

export const useCreateCoreWorkflow = () => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Workflow,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Workflow,
  });

  const { buildRecordInputFromRLSPredicates } =
    useBuildRecordInputFromRLSPredicates({
      objectMetadataItem,
    });

  const [isCreatingCoreWorkflow, setIsCreatingCoreWorkflow] = useState(false);

  const navigate = useNavigateApp();

  const { enqueueErrorSnackBar } = useSnackBar();

  const canCreateCoreWorkflow = canCreateRecordsForObjectMetadataItem({
    objectPermissions,
    objectMetadataItem,
  });

  const createCoreWorkflow = useCallback(async () => {
    if (isCreatingCoreWorkflow) {
      return;
    }

    setIsCreatingCoreWorkflow(true);

    const workflowId = v4();

    try {
      await createOneRecord({
        id: workflowId,
        ...buildRecordInputFromRLSPredicates(),
      });
    } catch (error) {
      logError(error);
      enqueueErrorSnackBar({ message: t`Failed to create workflow` });

      return;
    } finally {
      setIsCreatingCoreWorkflow(false);
    }

    navigate(AppPath.RecordShowPage, {
      objectNameSingular: CoreObjectNameSingular.Workflow,
      objectRecordId: workflowId,
    });
  }, [
    buildRecordInputFromRLSPredicates,
    createOneRecord,
    navigate,
    enqueueErrorSnackBar,
    isCreatingCoreWorkflow,
  ]);

  return { createCoreWorkflow, canCreateCoreWorkflow, isCreatingCoreWorkflow };
};
