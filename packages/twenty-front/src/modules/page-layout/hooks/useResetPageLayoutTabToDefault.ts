import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { CrudOperationType } from 'twenty-shared/types';

import { useInvalidateMetadataStore } from '@/metadata-store/hooks/useInvalidateMetadataStore';
import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { RESET_PAGE_LAYOUT_TAB_TO_DEFAULT } from '@/page-layout/graphql/mutations/resetPageLayoutTabToDefault';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

export const useResetPageLayoutTabToDefault = () => {
  const [resetMutation] = useMutation(RESET_PAGE_LAYOUT_TAB_TO_DEFAULT);

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { invalidateMetadataStore } = useInvalidateMetadataStore();

  const resetPageLayoutTabToDefault = useCallback(
    async (tabId: string) => {
      try {
        await resetMutation({
          variables: { id: tabId },
        });

        closeSidePanelMenu();
        invalidateMetadataStore();
      } catch (error) {
        if (CombinedGraphQLErrors.is(error)) {
          handleMetadataError(error, {
            primaryMetadataName: 'pageLayoutTab',
            operationType: CrudOperationType.UPDATE,
          });
        } else {
          enqueueErrorSnackBar({ message: t`An error occurred.` });
        }
      }
    },
    [
      resetMutation,
      closeSidePanelMenu,
      invalidateMetadataStore,
      handleMetadataError,
      enqueueErrorSnackBar,
    ],
  );

  return { resetPageLayoutTabToDefault };
};
