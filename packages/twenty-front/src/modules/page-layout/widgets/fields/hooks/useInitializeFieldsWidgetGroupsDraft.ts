import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetGroupsPersistedComponentState } from '@/page-layout/states/fieldsWidgetGroupsPersistedComponentState';
import { hasInitializedFieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/hasInitializedFieldsWidgetGroupsDraftComponentState';
import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useStore } from 'jotai';
import { useCallback, useEffect } from 'react';

type UseInitializeFieldsWidgetGroupsDraftParams = {
  pageLayoutId: string;
  widgetId: string;
  serverGroups: FieldsWidgetGroup[];
};

export const useInitializeFieldsWidgetGroupsDraft = ({
  pageLayoutId,
  widgetId,
  serverGroups,
}: UseInitializeFieldsWidgetGroupsDraftParams) => {
  const fieldsWidgetGroupsDraftState = useRecoilComponentStateCallbackStateV2(
    fieldsWidgetGroupsDraftComponentState,
    pageLayoutId,
  );

  const fieldsWidgetGroupsPersistedState =
    useRecoilComponentStateCallbackStateV2(
      fieldsWidgetGroupsPersistedComponentState,
      pageLayoutId,
    );

  const hasInitializedFieldsWidgetGroupsDraftState =
    useRecoilComponentStateCallbackStateV2(
      hasInitializedFieldsWidgetGroupsDraftComponentState,
      pageLayoutId,
    );

  const store = useStore();

  const initializeDraft = useCallback(() => {
    const hasInitialized = store.get(
      hasInitializedFieldsWidgetGroupsDraftState,
    );

    if (hasInitialized[widgetId]) {
      return;
    }

    const currentDraft = store.get(fieldsWidgetGroupsDraftState);

    const hasDraftForWidget = widgetId in currentDraft;

    if (!hasDraftForWidget) {
      store.set(fieldsWidgetGroupsDraftState, (prev) => ({
        ...prev,
        [widgetId]: serverGroups,
      }));

      store.set(fieldsWidgetGroupsPersistedState, (prev) => ({
        ...prev,
        [widgetId]: serverGroups,
      }));
    }

    store.set(hasInitializedFieldsWidgetGroupsDraftState, (prev) => ({
      ...prev,
      [widgetId]: true,
    }));
  }, [
    hasInitializedFieldsWidgetGroupsDraftState,
    fieldsWidgetGroupsDraftState,
    fieldsWidgetGroupsPersistedState,
    widgetId,
    serverGroups,
    store,
  ]);

  useEffect(() => {
    if (serverGroups.length > 0) {
      initializeDraft();
    }
  }, [serverGroups, initializeDraft]);
};
