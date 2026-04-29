import { UPSERT_FIELDS_WIDGET } from '@/page-layout/graphql/mutations/upsertFieldsWidget';
import { useHasFieldsWidgetChanges } from '@/page-layout/hooks/useHasFieldsWidgetChanges';
import { fieldsWidgetEditorModeDraftComponentState } from '@/page-layout/states/fieldsWidgetEditorModeDraftComponentState';
import { fieldsWidgetEditorModePersistedComponentState } from '@/page-layout/states/fieldsWidgetEditorModePersistedComponentState';
import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetGroupsPersistedComponentState } from '@/page-layout/states/fieldsWidgetGroupsPersistedComponentState';
import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { fieldsWidgetUngroupedFieldsPersistedComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsPersistedComponentState';
import { useMutation } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  type UpsertFieldsWidgetInput,
  type ViewFragmentFragment,
} from '~/generated-metadata/graphql';

export const useSaveFieldsWidgetGroups = () => {
  const [upsertFieldsWidgetMutation] = useMutation<
    { upsertFieldsWidget: ViewFragmentFragment },
    { input: UpsertFieldsWidgetInput }
  >(UPSERT_FIELDS_WIDGET);

  const { hasFieldsWidgetChanges } = useHasFieldsWidgetChanges();

  const store = useStore();

  const saveFieldsWidgetGroups = useCallback(
    async (pageLayoutId: string) => {
      if (!hasFieldsWidgetChanges(pageLayoutId)) {
        return;
      }

      const allDraftGroups = store.get(
        fieldsWidgetGroupsDraftComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
      );
      const allPersistedGroups = store.get(
        fieldsWidgetGroupsPersistedComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
      );
      const allUngroupedFieldsDraft = store.get(
        fieldsWidgetUngroupedFieldsDraftComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
      );
      const allEditorModes = store.get(
        fieldsWidgetEditorModeDraftComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
      );

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
                  fields: group.fields.map((field) => ({
                    ...(isDefined(field.viewFieldId)
                      ? { viewFieldId: field.viewFieldId }
                      : {
                          fieldMetadataId: field.fieldMetadataItem.id,
                        }),
                    isVisible: field.isVisible,
                    position: field.position,
                  })),
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
                fields: ungroupedFields.map((field) => ({
                  ...(isDefined(field.viewFieldId)
                    ? { viewFieldId: field.viewFieldId }
                    : {
                        fieldMetadataId: field.fieldMetadataItem.id,
                      }),
                  isVisible: field.isVisible,
                  position: field.position,
                })),
              },
            },
          });
        }
      }

      store.set(
        fieldsWidgetGroupsPersistedComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
        allDraftGroups,
      );
      store.set(
        fieldsWidgetUngroupedFieldsPersistedComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
        allUngroupedFieldsDraft,
      );
      store.set(
        fieldsWidgetEditorModePersistedComponentState.atomFamily({
          instanceId: pageLayoutId,
        }),
        allEditorModes,
      );
    },
    [hasFieldsWidgetChanges, store, upsertFieldsWidgetMutation],
  );

  return { saveFieldsWidgetGroups };
};
