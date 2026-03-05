import { UPSERT_FIELDS_WIDGET } from '@/page-layout/graphql/mutations/upsertFieldsWidget';
import { fieldsWidgetEditorModeDraftComponentState } from '@/page-layout/states/fieldsWidgetEditorModeDraftComponentState';
import { fieldsWidgetEditorModePersistedComponentState } from '@/page-layout/states/fieldsWidgetEditorModePersistedComponentState';
import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetGroupsPersistedComponentState } from '@/page-layout/states/fieldsWidgetGroupsPersistedComponentState';
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

  const fieldsWidgetEditorModeDraftState = useAtomComponentStateCallbackState(
    fieldsWidgetEditorModeDraftComponentState,
    pageLayoutId,
  );

  const fieldsWidgetEditorModePersistedState =
    useAtomComponentStateCallbackState(
      fieldsWidgetEditorModePersistedComponentState,
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
    const allEditorModes = store.get(fieldsWidgetEditorModeDraftState);

    const widgetIds = new Set([
      ...Object.keys(allDraftGroups),
      ...Object.keys(allPersistedGroups),
      ...Object.keys(allUngroupedFieldsDraft),
    ]);

    for (const widgetId of widgetIds) {
      const editorMode = allEditorModes[widgetId] ?? 'ungrouped';

      if (editorMode === 'grouped') {
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
    store.set(fieldsWidgetEditorModePersistedState, allEditorModes);

    await refreshAllCoreViews();

    return { status: 'successful' as const };
  }, [
    fieldsWidgetGroupsDraftState,
    fieldsWidgetGroupsPersistedState,
    fieldsWidgetUngroupedFieldsDraftState,
    fieldsWidgetUngroupedFieldsPersistedState,
    fieldsWidgetEditorModeDraftState,
    fieldsWidgetEditorModePersistedState,
    upsertFieldsWidgetMutation,
    refreshAllCoreViews,
    store,
  ]);

  return { saveFieldsWidgetGroups };
};
