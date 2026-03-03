import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetGroupsPersistedComponentState } from '@/page-layout/states/fieldsWidgetGroupsPersistedComponentState';
import { fieldsWidgetModeDraftComponentState } from '@/page-layout/states/fieldsWidgetModeDraftComponentState';
import { fieldsWidgetModePersistedComponentState } from '@/page-layout/states/fieldsWidgetModePersistedComponentState';
import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { fieldsWidgetUngroupedFieldsPersistedComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsPersistedComponentState';
import { hasInitializedFieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/hasInitializedFieldsWidgetGroupsDraftComponentState';
import { type FieldsWidgetEditorMode } from '@/page-layout/widgets/fields/types/FieldsWidgetEditorMode';
import {
  type FieldsWidgetGroup,
  type FieldsWidgetGroupField,
} from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback, useEffect } from 'react';

type UseInitializeFieldsWidgetGroupsDraftParams = {
  pageLayoutId: string;
  widgetId: string;
  persistedGroups: FieldsWidgetGroup[];
  persistedUngroupedFields: FieldsWidgetGroupField[];
  persistedMode: FieldsWidgetEditorMode;
};

export const useInitializeFieldsWidgetGroupsDraft = ({
  pageLayoutId,
  widgetId,
  persistedGroups,
  persistedUngroupedFields,
  persistedMode,
}: UseInitializeFieldsWidgetGroupsDraftParams) => {
  const fieldsWidgetGroupsDraftState = useAtomComponentStateCallbackState(
    fieldsWidgetGroupsDraftComponentState,
    pageLayoutId,
  );

  const fieldsWidgetGroupsPersistedState = useAtomComponentStateCallbackState(
    fieldsWidgetGroupsPersistedComponentState,
    pageLayoutId,
  );

  const fieldsWidgetUngroupedFieldsDraftState =
    useAtomComponentStateCallbackState(
      fieldsWidgetUngroupedFieldsDraftComponentState,
      pageLayoutId,
    );

  const fieldsWidgetUngroupedFieldsPersistedState =
    useAtomComponentStateCallbackState(
      fieldsWidgetUngroupedFieldsPersistedComponentState,
      pageLayoutId,
    );

  const fieldsWidgetModeDraftState = useAtomComponentStateCallbackState(
    fieldsWidgetModeDraftComponentState,
    pageLayoutId,
  );

  const fieldsWidgetModePersistedState = useAtomComponentStateCallbackState(
    fieldsWidgetModePersistedComponentState,
    pageLayoutId,
  );

  const hasInitializedFieldsWidgetGroupsDraftState =
    useAtomComponentStateCallbackState(
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
        [widgetId]: persistedGroups,
      }));

      store.set(fieldsWidgetGroupsPersistedState, (prev) => ({
        ...prev,
        [widgetId]: persistedGroups,
      }));

      store.set(fieldsWidgetUngroupedFieldsDraftState, (prev) => ({
        ...prev,
        [widgetId]: persistedUngroupedFields,
      }));

      store.set(fieldsWidgetUngroupedFieldsPersistedState, (prev) => ({
        ...prev,
        [widgetId]: persistedUngroupedFields,
      }));
    }

    // Mode initialization is independent so it's always set,
    // even if draft already existed from a previous code version.
    const currentModes = store.get(fieldsWidgetModeDraftState);

    if (!(widgetId in currentModes)) {
      store.set(fieldsWidgetModeDraftState, (prev) => ({
        ...prev,
        [widgetId]: persistedMode,
      }));

      store.set(fieldsWidgetModePersistedState, (prev) => ({
        ...prev,
        [widgetId]: persistedMode,
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
    fieldsWidgetUngroupedFieldsDraftState,
    fieldsWidgetUngroupedFieldsPersistedState,
    fieldsWidgetModeDraftState,
    fieldsWidgetModePersistedState,
    widgetId,
    persistedGroups,
    persistedUngroupedFields,
    persistedMode,
    store,
  ]);

  useEffect(() => {
    const hasData =
      persistedGroups.length > 0 || persistedUngroupedFields.length > 0;

    if (hasData) {
      initializeDraft();
    }
  }, [persistedGroups, persistedUngroupedFields, initializeDraft]);
};
