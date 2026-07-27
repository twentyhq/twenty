import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useCanEditPageLayouts } from '@/page-layout/hooks/useCanEditPageLayouts';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { currentPageLayoutIdState } from '@/page-layout/states/currentPageLayoutIdState';
import { fieldsWidgetEditorModeDraftComponentState } from '@/page-layout/states/fieldsWidgetEditorModeDraftComponentState';
import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { hasInitializedFieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/hasInitializedFieldsWidgetGroupsDraftComponentState';
import { isDashboardInEditModeComponentState } from '@/page-layout/states/isDashboardInEditModeComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { PageLayoutType } from '~/generated-metadata/graphql';

export const useSetIsPageLayoutInEditMode = (pageLayoutIdFromProps: string) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const isDashboardInEditModeState = useAtomComponentStateCallbackState(
    isDashboardInEditModeComponentState,
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

  const pageLayoutEditingWidgetIdState = useAtomComponentStateCallbackState(
    pageLayoutEditingWidgetIdComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const { canEditPageLayouts } = useCanEditPageLayouts();

  const setIsPageLayoutInEditMode = useCallback(
    (value: boolean) => {
      if (value && !canEditPageLayouts) {
        return;
      }

      const isLayoutCustomizationModeEnabled = store.get(
        isLayoutCustomizationModeEnabledState.atom,
      );

      const pageLayoutPersisted = store.get(
        pageLayoutPersistedComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
      );

      const isDashboardPageLayout =
        pageLayoutPersisted?.type === PageLayoutType.DASHBOARD;

      if (value && isLayoutCustomizationModeEnabled && isDashboardPageLayout) {
        return;
      }

      if (value) {
        store.set(pageLayoutEditingWidgetIdState, null);
        store.set(fieldsWidgetGroupsDraftState, {});
        store.set(fieldsWidgetUngroupedFieldsDraftState, {});
        store.set(fieldsWidgetEditorModeDraftState, {});
        store.set(hasInitializedFieldsWidgetGroupsDraftState, {});
      } else {
        store.set(pageLayoutEditingWidgetIdState, null);
      }

      store.set(isDashboardInEditModeState, value);

      if (value) {
        store.set(currentPageLayoutIdState.atom, pageLayoutId);
      }
    },
    [
      isDashboardInEditModeState,
      fieldsWidgetGroupsDraftState,
      fieldsWidgetUngroupedFieldsDraftState,
      fieldsWidgetEditorModeDraftState,
      hasInitializedFieldsWidgetGroupsDraftState,
      pageLayoutEditingWidgetIdState,
      pageLayoutId,
      store,
      canEditPageLayouts,
    ],
  );

  return { setIsPageLayoutInEditMode };
};
