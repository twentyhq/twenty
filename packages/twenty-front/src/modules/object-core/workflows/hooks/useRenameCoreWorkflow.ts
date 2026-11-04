import { useMutation } from '@apollo/client/react';
import { useToast } from 'twenty-ui/components/feedback';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { invalidateCoreWorkflowQueries } from '@/object-core/workflows/utils/invalidateCoreWorkflowQueries';
import { UpdateCoreWorkflowDocument } from '~/generated/graphql';
import { useLingui } from '@lingui/react/macro';

export const useRenameCoreWorkflow = ({
  coreWorkflowId,
  currentName,
}: {
  coreWorkflowId: string;
  currentName: string | undefined | null;
}) => {
  const { t } = useLingui();
  const client = useApolloCoreClient();
  const [updateWorkflow] = useMutation(UpdateCoreWorkflowDocument, { client });
  const { enqueueToast } = useToast();

  const renameWorkflow = async (name: string) => {
    if (name === currentName) {
      return true;
    }

    try {
      await updateWorkflow({ variables: { input: { coreWorkflowId, name } } });
      await invalidateCoreWorkflowQueries(client);

      return true;
    } catch (mutationError) {
      enqueueToast({
        status: 'error',
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
