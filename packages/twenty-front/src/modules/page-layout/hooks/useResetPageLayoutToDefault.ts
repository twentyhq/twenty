import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { CrudOperationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useInvalidateMetadataStore } from '@/metadata-store/hooks/useInvalidateMetadataStore';
import { RESET_PAGE_LAYOUT_TO_DEFAULT } from '@/page-layout/graphql/mutations/resetPageLayoutToDefault';
import { pageLayoutIsInitializedComponentState } from '@/page-layout/states/pageLayoutIsInitializedComponentState';
import { useToast } from 'twenty-ui/feedback';

export const useResetPageLayoutToDefault = () => {
  const [resetMutation] = useMutation(RESET_PAGE_LAYOUT_TO_DEFAULT);
  const { handleMetadataError } = useMetadataErrorHandler();
  const { add: addToast } = useToast();
  const { invalidateMetadataStore } = useInvalidateMetadataStore();
  const store = useStore();

  const resetPageLayoutToDefault = useCallback(
    async ({ pageLayoutId }: { pageLayoutId: string }) => {
      try {
        await resetMutation({ variables: { id: pageLayoutId } });

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
          addToast({ variant: 'error', children: t`An error occurred.` });
        }
      }
    },
    [
      resetMutation,
      store,
      invalidateMetadataStore,
      handleMetadataError,
      addToast,
    ],
  );

  return { resetPageLayoutToDefault };
};
