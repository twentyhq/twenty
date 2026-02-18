import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetGroupsPersistedComponentState } from '@/page-layout/states/fieldsWidgetGroupsPersistedComponentState';
import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useEffect, useRef } from 'react';
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

  const hasInitializedRef = useRef(false);

  const initializeDraft = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
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
      },
    [
      fieldsWidgetGroupsDraftState,
      fieldsWidgetGroupsPersistedState,
      widgetId,
      serverGroups,
    ],
  );

  useEffect(() => {
    if (serverGroups.length > 0 && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      initializeDraft();
    }
  }, [serverGroups, initializeDraft]);
};
