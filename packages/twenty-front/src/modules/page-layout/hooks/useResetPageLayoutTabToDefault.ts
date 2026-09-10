import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { CrudOperationType } from 'twenty-shared/types';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { RESET_PAGE_LAYOUT_TAB_TO_DEFAULT } from '@/page-layout/graphql/mutations/resetPageLayoutTabToDefault';
import { useRefreshPageLayoutAfterReset } from '@/page-layout/hooks/useRefreshPageLayoutAfterReset';
import { useToast } from 'twenty-ui/feedback';

export const useResetPageLayoutTabToDefault = (
  pageLayoutIdFromProps: string,
) => {
  const [resetMutation] = useMutation(RESET_PAGE_LAYOUT_TAB_TO_DEFAULT);
  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueToast } = useToast();
  const { refreshPageLayoutAfterReset } = useRefreshPageLayoutAfterReset(
    pageLayoutIdFromProps,
  );

  const resetPageLayoutTabToDefault = useCallback(
    async (tabId: string) => {
      try {
        await resetMutation({ variables: { id: tabId } });
        await refreshPageLayoutAfterReset();
      } catch (error) {
        if (CombinedGraphQLErrors.is(error)) {
          handleMetadataError(error, {
            primaryMetadataName: 'pageLayoutTab',
            operationType: CrudOperationType.UPDATE,
          });
        } else {
          enqueueToast({ variant: 'error', children: t`An error occurred.` });
        }
      }
    },
    [
      resetMutation,
      refreshPageLayoutAfterReset,
      handleMetadataError,
      enqueueToast,
    ],
  );

  return { resetPageLayoutTabToDefault };
};
