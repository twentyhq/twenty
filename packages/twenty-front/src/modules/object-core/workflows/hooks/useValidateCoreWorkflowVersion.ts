import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/primitives/feedback';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { ValidateCoreWorkflowVersionDocument } from '~/generated/graphql';

export const useValidateCoreWorkflowVersion = (
  coreWorkflowVersionId: string | undefined,
) => {
  const client = useApolloCoreClient();
  const [validateVersion, { loading: isValidating }] = useMutation(
    ValidateCoreWorkflowVersionDocument,
    { client },
  );
  const { enqueueToast } = useToast();

  const validate = async () => {
    if (!isDefined(coreWorkflowVersionId)) {
      return;
    }

    try {
      await validateVersion({ variables: { coreWorkflowVersionId } });
      enqueueToast({ variant: 'success', children: t`Workflow is valid` });
    } catch (mutationError) {
      enqueueToast({
        variant: 'error',
        children:
          mutationError instanceof Error
            ? mutationError.message
            : t`Could not save workflow`,
      });
    }
  };

  return { validate, isValidating };
};
