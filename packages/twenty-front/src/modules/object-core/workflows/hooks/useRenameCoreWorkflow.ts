import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useToast } from 'twenty-ui/primitives/feedback';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { UpdateCoreWorkflowDocument } from '~/generated/graphql';

export const useRenameCoreWorkflow = ({
  coreWorkflowId,
  currentName,
}: {
  coreWorkflowId: string;
  currentName: string | undefined | null;
}) => {
  const client = useApolloCoreClient();
  const [updateWorkflow] = useMutation(UpdateCoreWorkflowDocument, { client });
  const { enqueueToast } = useToast();

  const renameWorkflow = async (name: string) => {
    if (name === currentName) {
      return true;
    }

    try {
      await updateWorkflow({ variables: { input: { coreWorkflowId, name } } });
      await invalidateCoreWorkflowVersions(client);

      return true;
    } catch (mutationError) {
      enqueueToast({
        variant: 'error',
        children:
          mutationError instanceof Error
            ? mutationError.message
            : t`Could not save workflow`,
      });

      return false;
    }
  };

  return { renameWorkflow };
};
