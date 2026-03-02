import { UPSERT_FIELDS_WIDGET } from '@/page-layout/graphql/mutations/upsertFieldsWidget';
import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetGroupsPersistedComponentState } from '@/page-layout/states/fieldsWidgetGroupsPersistedComponentState';
import { fieldsWidgetModeDraftComponentState } from '@/page-layout/states/fieldsWidgetModeDraftComponentState';
import { fieldsWidgetModePersistedComponentState } from '@/page-layout/states/fieldsWidgetModePersistedComponentState';
import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { fieldsWidgetUngroupedFieldsPersistedComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsPersistedComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useRefreshAllCoreViews } from '@/views/hooks/useRefreshAllCoreViews';
import { useMutation } from '@apollo/client';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type ViewFragmentFragment } from '~/generated-metadata/graphql';

type UpsertFieldsWidgetInput = {
  widgetId: string;
  groups?: {
    id: string;
    name: string;
    position: number;
    isVisible: boolean;
    fields: {
      viewFieldId: string;
      isVisible: boolean;
      position: number;
    }[];
  }[];
  fields?: {
    viewFieldId: string;
    isVisible: boolean;
    position: number;
  }[];
};

type UpsertFieldsWidgetResult = {
  upsertFieldsWidget: ViewFragmentFragment;
};

type UseSaveFieldsWidgetGroupsParams = {
  pageLayoutId: string;
};

export const useSaveFieldsWidgetGroups = ({
  pageLayoutId,
}: UseSaveFieldsWidgetGroupsParams) => {
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

  const [upsertFieldsWidgetMutation] = useMutation<
    UpsertFieldsWidgetResult,
    { input: UpsertFieldsWidgetInput }
  >(UPSERT_FIELDS_WIDGET);

  const { refreshAllCoreViews } = useRefreshAllCoreViews();

  const store = useStore();

  const saveFieldsWidgetGroups = useCallback(async () => {
    const allDraftGroups = store.get(fieldsWidgetGroupsDraftState);
    const allPersistedGroups = store.get(fieldsWidgetGroupsPersistedState);
    const allUngroupedFieldsDraft = store.get(
      fieldsWidgetUngroupedFieldsDraftState,
    );
    const allModes = store.get(fieldsWidgetModeDraftState);

    const widgetIds = new Set([
      ...Object.keys(allDraftGroups),
      ...Object.keys(allPersistedGroups),
      ...Object.keys(allUngroupedFieldsDraft),
    ]);

    for (const widgetId of widgetIds) {
      const mode = allModes[widgetId] ?? 'ungrouped';

      if (mode === 'grouped') {
        const draftGroups = allDraftGroups[widgetId] ?? [];

        await upsertFieldsWidgetMutation({
          variables: {
            input: {
              widgetId,
              groups: draftGroups.map((group) => ({
                id: group.id,
                name: group.name,
                position: group.position,
                isVisible: group.isVisible,
                fields: group.fields.flatMap((field) => {
                  if (!isDefined(field.viewFieldId)) {
                    return [];
                  }

                  return [
                    {
                      viewFieldId: field.viewFieldId,
                      isVisible: field.isVisible,
                      position: field.position,
                    },
                  ];
                }),
              })),
            },
          },
        });
      } else {
        const ungroupedFields = allUngroupedFieldsDraft[widgetId] ?? [];

        await upsertFieldsWidgetMutation({
          variables: {
            input: {
              widgetId,
              fields: ungroupedFields.flatMap((field) => {
                if (!isDefined(field.viewFieldId)) {
                  return [];
                }

                return [
                  {
                    viewFieldId: field.viewFieldId,
                    isVisible: field.isVisible,
                    position: field.position,
                  },
                ];
              }),
            },
          },
        });
      }
    }

    store.set(fieldsWidgetGroupsPersistedState, allDraftGroups);
    store.set(
      fieldsWidgetUngroupedFieldsPersistedState,
      allUngroupedFieldsDraft,
    );
    store.set(fieldsWidgetModePersistedState, allModes);

    await refreshAllCoreViews();

    return { status: 'successful' as const };
  }, [
    fieldsWidgetGroupsDraftState,
    fieldsWidgetGroupsPersistedState,
    fieldsWidgetUngroupedFieldsDraftState,
    fieldsWidgetUngroupedFieldsPersistedState,
    fieldsWidgetModeDraftState,
    fieldsWidgetModePersistedState,
    upsertFieldsWidgetMutation,
    refreshAllCoreViews,
    store,
  ]);

  return { saveFieldsWidgetGroups };
};
