import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { useToast } from 'twenty-ui/primitives/feedback';

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
  const [updateVisibilityMutation] = useMutation(
    UpdateCoreWorkflowVisibilityDocument,
    { client },
  );
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);
  const { enqueueToast } = useToast();

  const updateVisibility = async (visibility: WorkflowVisibility) => {
    setIsUpdatingVisibility(true);

    try {
      await updateVisibilityMutation({
        variables: { input: { coreWorkflowId, visibility } },
      });
    } catch (mutationError) {
      logError(mutationError);
      enqueueToast({
        variant: 'error',
        children: t`Could not change who can see this workflow`,
      });
    } finally {
      setIsUpdatingVisibility(false);
    }
  };

  return { updateVisibility, isUpdatingVisibility };
};
