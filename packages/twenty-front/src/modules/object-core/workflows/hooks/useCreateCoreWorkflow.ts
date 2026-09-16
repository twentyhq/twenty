import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useCallback, useState } from 'react';
import { AppPath } from 'twenty-shared/types';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { CREATE_CORE_WORKFLOW } from '@/object-core/workflows/graphql/mutations/createCoreWorkflow';
import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useToast } from 'twenty-ui/primitives/feedback';
import {
  type CreateCoreWorkflowMutation,
  type CreateCoreWorkflowMutationVariables,
} from '~/generated/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { logError } from '~/utils/logError';

export const useCreateCoreWorkflow = () => {
  const apolloCoreClient = useApolloCoreClient();

  const canCreateCoreWorkflow = useHasPermissionFlag(
    PermissionFlagType.WORKFLOWS,
  );

  const [createCoreWorkflowMutation] = useMutation<
    CreateCoreWorkflowMutation,
    CreateCoreWorkflowMutationVariables
  >(CREATE_CORE_WORKFLOW, { client: apolloCoreClient });

  const [isCreatingCoreWorkflow, setIsCreatingCoreWorkflow] = useState(false);

  const navigate = useNavigateApp();

  const { enqueueToast } = useToast();

  const createCoreWorkflow = useCallback(async () => {
    if (isCreatingCoreWorkflow || !canCreateCoreWorkflow) {
      return;
    }

    setIsCreatingCoreWorkflow(true);

    let coreWorkflowId: string | null | undefined;

    try {
      const { data } = await createCoreWorkflowMutation({
        variables: { input: {} },
      });

      coreWorkflowId = data?.createCoreWorkflow.id;
    } catch (error) {
      logError(error);
      enqueueToast({
        variant: 'error',
        children: t`Failed to create workflow`,
      });

      return;
    } finally {
      setIsCreatingCoreWorkflow(false);
    }

    if (!isDefined(coreWorkflowId)) {
      enqueueToast({
        variant: 'error',
        children: t`Failed to create workflow`,
      });

      return;
    }

    navigate(AppPath.WorkflowCoreShowPage, { coreWorkflowId });
    await invalidateCoreWorkflowVersions(apolloCoreClient);
  }, [
    canCreateCoreWorkflow,
    apolloCoreClient,
    createCoreWorkflowMutation,
    navigate,
    enqueueToast,
    isCreatingCoreWorkflow,
  ]);

  return { createCoreWorkflow, canCreateCoreWorkflow, isCreatingCoreWorkflow };
};
