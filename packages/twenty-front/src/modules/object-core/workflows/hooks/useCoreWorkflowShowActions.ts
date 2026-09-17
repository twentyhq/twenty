import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import {
  UpdateCoreWorkflowDocument,
  ValidateCoreWorkflowVersionDocument,
} from '~/generated/graphql';

export const useCoreWorkflowShowActions = ({
  coreWorkflowId,
  coreWorkflowVersionId,
  name: currentName,
}: {
  coreWorkflowId: string;
  coreWorkflowVersionId: string | undefined;
  name: string | undefined | null;
}) => {
  const client = useApolloCoreClient();
  const [updateWorkflow] = useMutation(UpdateCoreWorkflowDocument, { client });
  const [validateVersion, { loading: isValidating }] = useMutation(
    ValidateCoreWorkflowVersionDocument,
    { client },
  );
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();

  const renameWorkflow = async (name: string) => {
    if (name === currentName) {
      return true;
    }
    try {
      await updateWorkflow({ variables: { input: { coreWorkflowId, name } } });
      await invalidateCoreWorkflowVersions(client);
      return true;
    } catch (mutationError) {
      enqueueErrorSnackBar({
        message:
          mutationError instanceof Error
            ? mutationError.message
            : t`Could not save workflow`,
      });
      return false;
    }
  };

  const validate = async () => {
    if (!isDefined(coreWorkflowVersionId)) {
      return;
    }
    try {
      await validateVersion({
        variables: { coreWorkflowVersionId: coreWorkflowVersionId },
      });
      enqueueSuccessSnackBar({ message: t`Workflow is valid` });
    } catch (mutationError) {
      enqueueErrorSnackBar({
        message:
          mutationError instanceof Error
            ? mutationError.message
            : t`Could not save workflow`,
      });
    }
  };

  return { renameWorkflow, validate, isValidating };
};
