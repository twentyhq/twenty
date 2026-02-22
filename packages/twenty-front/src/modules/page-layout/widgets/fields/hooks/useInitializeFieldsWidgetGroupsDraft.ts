import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetGroupsPersistedComponentState } from '@/page-layout/states/fieldsWidgetGroupsPersistedComponentState';
import { hasInitializedFieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/hasInitializedFieldsWidgetGroupsDraftComponentState';
import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useEffect } from 'react';
import { useRecoilCallback } from 'recoil';

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
  const fieldsWidgetGroupsDraftState = useRecoilComponentCallbackState(
    fieldsWidgetGroupsDraftComponentState,
    pageLayoutId,
  );

  const fieldsWidgetGroupsPersistedState = useRecoilComponentCallbackState(
    fieldsWidgetGroupsPersistedComponentState,
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
      widgetId,
      serverGroups,
    ],
  );

  useEffect(() => {
    if (serverGroups.length > 0) {
      initializeDraft();
    }
  }, [serverGroups, initializeDraft]);
};
