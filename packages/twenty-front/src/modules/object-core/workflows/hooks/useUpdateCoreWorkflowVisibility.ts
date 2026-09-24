import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useToast } from 'twenty-ui/components';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import {
  UpdateCoreWorkflowVisibilityDocument,
  type WorkflowVisibility,
} from '~/generated/graphql';
import { logError } from '~/utils/logError';

export const useUpdateCoreWorkflowVisibility = ({
  coreWorkflowId,
}: {
  coreWorkflowId: string;
}) => {
  const client = useApolloCoreClient();
  const [updateVisibilityMutation, { loading: isUpdatingVisibility }] =
    useMutation(UpdateCoreWorkflowVisibilityDocument, { client });
  const { enqueueToast } = useToast();

  const updateVisibility = async (visibility: WorkflowVisibility) => {
    try {
      await updateVisibilityMutation({
        variables: { input: { coreWorkflowId, visibility } },
      });
    } catch (mutationError) {
      logError(mutationError);
      enqueueToast({
        variant: 'error',
        children:
          mutationError instanceof Error
            ? mutationError.message
            : t`Could not change who can see this workflow`,
      });
    }
  };

  return { updateVisibility, isUpdatingVisibility };
};
