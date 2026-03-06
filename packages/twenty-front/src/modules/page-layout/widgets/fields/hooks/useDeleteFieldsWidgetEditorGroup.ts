import { fieldsWidgetEditorModeDraftComponentState } from '@/page-layout/states/fieldsWidgetEditorModeDraftComponentState';
import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  type FieldsConfiguration,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';

type UseDeleteFieldsWidgetEditorGroupParams = {
  pageLayoutId: string;
  widgetId: string;
};

export const useDeleteFieldsWidgetEditorGroup = ({
  pageLayoutId,
  widgetId,
}: UseDeleteFieldsWidgetEditorGroupParams) => {
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

  const pageLayoutDraftState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const deleteGroup = useCallback(
    (groupId: string) => {
      const allDraftGroups = store.get(fieldsWidgetGroupsDraftState);

      const currentGroups = allDraftGroups[widgetId] ?? [];

      const deletedGroup = currentGroups.find((group) => group.id === groupId);

      if (!deletedGroup) {
        return;
      }

      const pageLayoutDraft = store.get(pageLayoutDraftState);

      const widget = pageLayoutDraft.tabs
        .flatMap((tab) => tab.widgets)
        .find((w) => w.id === widgetId);

      const fieldsConfiguration =
        isDefined(widget?.configuration) &&
        widget.configuration.configurationType ===
          WidgetConfigurationType.FIELDS
          ? (widget.configuration as FieldsConfiguration)
          : null;

      const currentViewFieldGroupId =
        fieldsConfiguration?.newFieldDefaultConfiguration?.viewFieldGroupId ??
        null;

      const isReferencedGroupBeingDeleted = currentViewFieldGroupId === groupId;

      const deletedGroupFields = deletedGroup.fields;
      const remainingGroups = currentGroups.filter(
        (group) => group.id !== groupId,
      );

      if (remainingGroups.length === 0) {
        store.set(fieldsWidgetGroupsDraftState, (prev) => ({
          ...prev,
          [widgetId]: [],
        }));

        store.set(fieldsWidgetUngroupedFieldsDraftState, (prev) => ({
          ...prev,
          [widgetId]: deletedGroupFields.map((field, index) => ({
            ...field,
            position: index,
            globalIndex: index,
          })),
        }));

        store.set(fieldsWidgetEditorModeDraftState, (prev) => ({
          ...prev,
          [widgetId]: 'ungrouped' as const,
        }));

        if (isDefined(fieldsConfiguration)) {
          store.set(pageLayoutDraftState, (prev) => ({
            ...prev,
            tabs: prev.tabs.map((tab) => ({
              ...tab,
              widgets: tab.widgets.map((w) =>
                w.id === widgetId
                  ? {
                      ...w,
                      configuration: {
                        ...fieldsConfiguration,
                        newFieldDefaultConfiguration: null,
                      },
                    }
                  : w,
              ),
            })),
          }));
        }

        return;
      }

      const sortedRemaining = [...remainingGroups].sort(
        (a, b) => a.position - b.position,
      );

      const deletedGroupPosition = deletedGroup.position;

      const nextGroup = sortedRemaining.find(
        (group) => group.position > deletedGroupPosition,
      );

      const targetGroup =
        nextGroup ?? sortedRemaining[sortedRemaining.length - 1];

      store.set(fieldsWidgetGroupsDraftState, (prev) => ({
        ...prev,
        [widgetId]: remainingGroups.map((group) => {
          if (group.id !== targetGroup.id) {
            return group;
          }

          const existingFields = [...group.fields].sort(
            (a, b) => a.position - b.position,
          );

          const maxPosition =
            existingFields.length > 0
              ? Math.max(...existingFields.map((f) => f.position))
              : -1;

          const appendedFields = deletedGroupFields.map((field, index) => ({
            ...field,
            position: maxPosition + 1 + index,
          }));

          return {
            ...group,
            fields: [...existingFields, ...appendedFields],
          };
        }),
      }));

      if (isReferencedGroupBeingDeleted && isDefined(fieldsConfiguration)) {
        store.set(pageLayoutDraftState, (prev) => ({
          ...prev,
          tabs: prev.tabs.map((tab) => ({
            ...tab,
            widgets: tab.widgets.map((w) =>
              w.id === widgetId
                ? {
                    ...w,
                    configuration: {
                      ...fieldsConfiguration,
                      newFieldDefaultConfiguration: {
                        isVisible:
                          fieldsConfiguration.newFieldDefaultConfiguration
                            ?.isVisible ?? true,
                        viewFieldGroupId: targetGroup.id,
                      },
                    },
                  }
                : w,
            ),
          })),
        }));
      }
    },
    [
      fieldsWidgetGroupsDraftState,
      fieldsWidgetUngroupedFieldsDraftState,
      fieldsWidgetEditorModeDraftState,
      pageLayoutDraftState,
      widgetId,
      store,
    ],
  );

  return { deleteGroup };
};
