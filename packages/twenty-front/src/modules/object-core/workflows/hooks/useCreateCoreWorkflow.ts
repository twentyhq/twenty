import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useCallback, useState } from 'react';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CREATE_CORE_WORKFLOW } from '@/object-core/workflows/graphql/mutations/createCoreWorkflow';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { canCreateRecordsForObjectMetadataItem } from '@/object-record/utils/canCreateRecordsForObjectMetadataItem';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import {
  type CreateCoreWorkflowMutation,
  type CreateCoreWorkflowMutationVariables,
} from '~/generated/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { logError } from '~/utils/logError';

export const useCreateCoreWorkflow = () => {
  const apolloCoreClient = useApolloCoreClient();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Workflow,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const [createCoreWorkflowMutation] = useMutation<
    CreateCoreWorkflowMutation,
    CreateCoreWorkflowMutationVariables
  >(CREATE_CORE_WORKFLOW, { client: apolloCoreClient });

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

    let workspaceWorkflowId: string | null | undefined;

    try {
      const { data } = await createCoreWorkflowMutation({
        variables: { input: {} },
      });

      workspaceWorkflowId = data?.createCoreWorkflow.workspaceWorkflowId;
    } catch (error) {
      logError(error);
      enqueueErrorSnackBar({ message: t`Failed to create workflow` });

      return;
    } finally {
      setIsCreatingCoreWorkflow(false);
    }

    if (!isDefined(workspaceWorkflowId)) {
      enqueueErrorSnackBar({ message: t`Failed to create workflow` });

      return;
    }

    navigate(AppPath.RecordShowPage, {
      objectNameSingular: CoreObjectNameSingular.Workflow,
      objectRecordId: workspaceWorkflowId,
    });
  }, [
    createCoreWorkflowMutation,
    navigate,
    enqueueErrorSnackBar,
    isCreatingCoreWorkflow,
  ]);

  return { createCoreWorkflow, canCreateCoreWorkflow, isCreatingCoreWorkflow };
};
