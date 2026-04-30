import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { FindOnePageLayoutDocument } from '~/generated-metadata/graphql';

import { useExitLayoutCustomizationMode } from '@/layout-customization/hooks/useExitLayoutCustomizationMode';
import { useInvalidateMetadataStore } from '@/metadata-store/hooks/useInvalidateMetadataStore';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { fieldsWidgetEditorModeDraftComponentState } from '@/page-layout/states/fieldsWidgetEditorModeDraftComponentState';
import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { hasInitializedFieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/hasInitializedFieldsWidgetGroupsDraftComponentState';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { convertPageLayoutToTabLayouts } from '@/page-layout/utils/convertPageLayoutToTabLayouts';
import { toDraftPageLayout } from '@/page-layout/utils/toDraftPageLayout';
import { transformPageLayout } from '@/page-layout/utils/transformPageLayout';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

export const useRefreshPageLayoutAfterReset = (
  pageLayoutIdFromProps: string,
) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const client = useApolloClient();
  const store = useStore();

  const { setIsPageLayoutInEditMode } =
    useSetIsPageLayoutInEditMode(pageLayoutId);
  const { exitLayoutCustomizationMode } = useExitLayoutCustomizationMode();
  const { invalidateMetadataStore } = useInvalidateMetadataStore();

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

  const fieldsWidgetGroupsDraftState = useAtomComponentStateCallbackState(
    fieldsWidgetGroupsDraftComponentState,
    pageLayoutId,
  );

  const fieldsWidgetUngroupedFieldsDraftState =
    useAtomComponentStateCallbackState(
      fieldsWidgetUngroupedFieldsDraftComponentState,
      pageLayoutId,
    );

  const fieldsWidgetEditorModeDraftState = useAtomComponentStateCallbackState(
    fieldsWidgetEditorModeDraftComponentState,
    pageLayoutId,
  );

  const hasInitializedFieldsWidgetGroupsDraftState =
    useAtomComponentStateCallbackState(
      hasInitializedFieldsWidgetGroupsDraftComponentState,
      pageLayoutId,
    );

  const refreshPageLayoutAfterReset = useCallback(async () => {
    const { data } = await client.query({
      query: FindOnePageLayoutDocument,
      variables: { id: pageLayoutId },
      fetchPolicy: 'network-only',
    });

    if (isDefined(data?.getPageLayout)) {
      const freshLayout = transformPageLayout(data.getPageLayout);

      store.set(pageLayoutPersistedState, freshLayout);
      store.set(pageLayoutDraftState, toDraftPageLayout(freshLayout));
      store.set(
        pageLayoutCurrentLayoutsState,
        convertPageLayoutToTabLayouts(freshLayout),
      );
    }

    store.set(fieldsWidgetGroupsDraftState, {});
    store.set(fieldsWidgetUngroupedFieldsDraftState, {});
    store.set(fieldsWidgetEditorModeDraftState, {});
    store.set(hasInitializedFieldsWidgetGroupsDraftState, {});

    setIsPageLayoutInEditMode(false);
    exitLayoutCustomizationMode();
    invalidateMetadataStore();
  }, [
    client,
    pageLayoutId,
    store,
    pageLayoutPersistedState,
    pageLayoutDraftState,
    pageLayoutCurrentLayoutsState,
    fieldsWidgetGroupsDraftState,
    fieldsWidgetUngroupedFieldsDraftState,
    fieldsWidgetEditorModeDraftState,
    hasInitializedFieldsWidgetGroupsDraftState,
    setIsPageLayoutInEditMode,
    exitLayoutCustomizationMode,
    invalidateMetadataStore,
  ]);

  return { refreshPageLayoutAfterReset };
};
