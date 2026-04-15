import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { CrudOperationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useInvalidateMetadataStore } from '@/metadata-store/hooks/useInvalidateMetadataStore';
import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { RESET_PAGE_LAYOUT_TO_DEFAULT } from '@/page-layout/graphql/mutations/resetPageLayoutToDefault';
import { pageLayoutIsInitializedComponentState } from '@/page-layout/states/pageLayoutIsInitializedComponentState';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { collectViewIdsFromWidgets } from '@/page-layout/utils/collectViewIdsFromWidgets';
import { evictViewMetadataForViewIds } from '@/page-layout/utils/evictViewMetadataForViewIds';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

export const useResetPageLayoutToDefault = () => {
  const [resetMutation] = useMutation(RESET_PAGE_LAYOUT_TO_DEFAULT);
  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { invalidateMetadataStore } = useInvalidateMetadataStore();
  const store = useStore();

  const resetPageLayoutToDefault = useCallback(
    async ({
      pageLayoutId,
      pageLayout,
    }: {
      pageLayoutId: string;
      pageLayout: PageLayout;
    }) => {
      const preResetViewIds = collectViewIdsFromWidgets(
        pageLayout.tabs.flatMap((tab) => tab.widgets),
      );

      try {
        await resetMutation({ variables: { id: pageLayoutId } });

        evictViewMetadataForViewIds(store, preResetViewIds);

        if (isDefined(pageLayoutId)) {
          store.set(
            pageLayoutIsInitializedComponentState.atomFamily({
              instanceId: pageLayoutId,
            }),
            false,
          );
        }

        invalidateMetadataStore();
      } catch (error) {
        if (CombinedGraphQLErrors.is(error)) {
          handleMetadataError(error, {
            primaryMetadataName: 'pageLayout',
            operationType: CrudOperationType.UPDATE,
          });
        } else {
          enqueueErrorSnackBar({ message: t`An error occurred.` });
        }
      }
    },
    [
      resetMutation,
      store,
      invalidateMetadataStore,
      handleMetadataError,
      enqueueErrorSnackBar,
    ],
  );

  return { resetPageLayoutToDefault };
};
