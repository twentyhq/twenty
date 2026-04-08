import { useApolloClient } from '@apollo/client/react';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { CrudOperationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { FindOnePageLayoutDocument } from '~/generated-metadata/graphql';

import { useExitLayoutCustomizationMode } from '@/layout-customization/hooks/useExitLayoutCustomizationMode';
import { useInvalidateMetadataStore } from '@/metadata-store/hooks/useInvalidateMetadataStore';
import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { RESET_PAGE_LAYOUT_TAB_TO_DEFAULT } from '@/page-layout/graphql/mutations/resetPageLayoutTabToDefault';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { convertPageLayoutToTabLayouts } from '@/page-layout/utils/convertPageLayoutToTabLayouts';
import { transformPageLayout } from '@/page-layout/utils/transformPageLayout';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

export const useResetPageLayoutTabToDefault = (
  pageLayoutIdFromProps: string,
) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const client = useApolloClient();
  const [resetMutation] = useMutation(RESET_PAGE_LAYOUT_TAB_TO_DEFAULT);

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { invalidateMetadataStore } = useInvalidateMetadataStore();
  const { setIsPageLayoutInEditMode } =
    useSetIsPageLayoutInEditMode(pageLayoutId);
  const { exitLayoutCustomizationMode } = useExitLayoutCustomizationMode();

  const store = useStore();

  const pageLayoutPersistedState = useAtomComponentStateCallbackState(
    pageLayoutPersistedComponentState,
    pageLayoutId,
  );

  const pageLayoutDraftState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const pageLayoutCurrentLayoutsState = useAtomComponentStateCallbackState(
    pageLayoutCurrentLayoutsComponentState,
    pageLayoutId,
  );

  const resetPageLayoutTabToDefault = useCallback(
    async (tabId: string) => {
      try {
        await resetMutation({
          variables: { id: tabId },
        });

        const { data } = await client.query({
          query: FindOnePageLayoutDocument,
          variables: { id: pageLayoutId },
          fetchPolicy: 'network-only',
        });

        if (isDefined(data?.getPageLayout)) {
          const freshLayout = transformPageLayout(data.getPageLayout);

          store.set(pageLayoutPersistedState, freshLayout);
          store.set(pageLayoutDraftState, {
            id: freshLayout.id,
            name: freshLayout.name,
            type: freshLayout.type,
            objectMetadataId: freshLayout.objectMetadataId,
            tabs: freshLayout.tabs,
            defaultTabToFocusOnMobileAndSidePanelId:
              freshLayout.defaultTabToFocusOnMobileAndSidePanelId,
          });
          store.set(
            pageLayoutCurrentLayoutsState,
            convertPageLayoutToTabLayouts(freshLayout),
          );
        }

        setIsPageLayoutInEditMode(false);
        exitLayoutCustomizationMode();
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
      client,
      pageLayoutId,
      pageLayoutPersistedState,
      pageLayoutDraftState,
      pageLayoutCurrentLayoutsState,
      setIsPageLayoutInEditMode,
      exitLayoutCustomizationMode,
      invalidateMetadataStore,
      handleMetadataError,
      enqueueErrorSnackBar,
      store,
    ],
  );

  return { resetPageLayoutTabToDefault };
};
