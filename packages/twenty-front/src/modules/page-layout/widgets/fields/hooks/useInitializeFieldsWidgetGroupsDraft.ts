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
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useEffect } from 'react';
import { useRecoilCallback } from 'recoil';

type UseInitializeFieldsWidgetGroupsDraftParams = {
  pageLayoutId: string;
  widgetId: string;
  serverGroups: FieldsWidgetGroup[];
  serverUngroupedFields: FieldsWidgetGroupField[];
  serverMode: FieldsWidgetEditorMode;
};

export const useInitializeFieldsWidgetGroupsDraft = ({
  pageLayoutId,
  widgetId,
  serverGroups,
  serverUngroupedFields,
  serverMode,
}: UseInitializeFieldsWidgetGroupsDraftParams) => {
  const fieldsWidgetGroupsDraftState = useRecoilComponentCallbackState(
    fieldsWidgetGroupsDraftComponentState,
    pageLayoutId,
  );

  const fieldsWidgetGroupsPersistedState = useRecoilComponentCallbackState(
    fieldsWidgetGroupsPersistedComponentState,
    pageLayoutId,
  );

  const fieldsWidgetUngroupedFieldsDraftState = useRecoilComponentCallbackState(
    fieldsWidgetUngroupedFieldsDraftComponentState,
    pageLayoutId,
  );

  const fieldsWidgetUngroupedFieldsPersistedState =
    useRecoilComponentCallbackState(
      fieldsWidgetUngroupedFieldsPersistedComponentState,
      pageLayoutId,
    );

  const fieldsWidgetModeDraftState = useRecoilComponentCallbackState(
    fieldsWidgetModeDraftComponentState,
    pageLayoutId,
  );

  const fieldsWidgetModePersistedState = useRecoilComponentCallbackState(
    fieldsWidgetModePersistedComponentState,
    pageLayoutId,
  );

  const hasInitializedFieldsWidgetGroupsDraftState =
    useRecoilComponentCallbackState(
      hasInitializedFieldsWidgetGroupsDraftComponentState,
      pageLayoutId,
    );

  const initializeDraft = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const hasInitialized = snapshot
          .getLoadable(hasInitializedFieldsWidgetGroupsDraftState)
          .getValue();

        if (hasInitialized[widgetId]) {
          return;
        }

        const currentDraft = snapshot
          .getLoadable(fieldsWidgetGroupsDraftState)
          .getValue();

        const hasDraftForWidget = widgetId in currentDraft;

        if (!hasDraftForWidget) {
          set(fieldsWidgetGroupsDraftState, (prev) => ({
            ...prev,
            [widgetId]: serverGroups,
          }));

          set(fieldsWidgetGroupsPersistedState, (prev) => ({
            ...prev,
            [widgetId]: serverGroups,
          }));

          set(fieldsWidgetUngroupedFieldsDraftState, (prev) => ({
            ...prev,
            [widgetId]: serverUngroupedFields,
          }));

          set(fieldsWidgetUngroupedFieldsPersistedState, (prev) => ({
            ...prev,
            [widgetId]: serverUngroupedFields,
          }));
        }

        // Mode initialization is independent so it's always set,
        // even if draft already existed from a previous code version.
        const currentModes = snapshot
          .getLoadable(fieldsWidgetModeDraftState)
          .getValue();

        if (!(widgetId in currentModes)) {
          set(fieldsWidgetModeDraftState, (prev) => ({
            ...prev,
            [widgetId]: serverMode,
          }));

          set(fieldsWidgetModePersistedState, (prev) => ({
            ...prev,
            [widgetId]: serverMode,
          }));
        }

        set(hasInitializedFieldsWidgetGroupsDraftState, (prev) => ({
          ...prev,
          [widgetId]: true,
        }));
      },
    [
      hasInitializedFieldsWidgetGroupsDraftState,
      fieldsWidgetGroupsDraftState,
      fieldsWidgetGroupsPersistedState,
      fieldsWidgetUngroupedFieldsDraftState,
      fieldsWidgetUngroupedFieldsPersistedState,
      fieldsWidgetModeDraftState,
      fieldsWidgetModePersistedState,
      widgetId,
      serverGroups,
      serverUngroupedFields,
      serverMode,
    ],
  );

  useEffect(() => {
    const hasData = serverGroups.length > 0 || serverUngroupedFields.length > 0;

    if (hasData) {
      initializeDraft();
    }
  }, [serverGroups, serverUngroupedFields, initializeDraft]);
};
