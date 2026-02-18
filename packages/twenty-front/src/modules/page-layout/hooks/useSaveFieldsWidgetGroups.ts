import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetGroupsPersistedComponentState } from '@/page-layout/states/fieldsWidgetGroupsPersistedComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { usePerformViewFieldAPIPersist } from '@/views/hooks/internal/usePerformViewFieldAPIPersist';
import { usePerformViewFieldGroupAPIPersist } from '@/views/hooks/internal/usePerformViewFieldGroupAPIPersist';
import { useRefreshAllCoreViews } from '@/views/hooks/useRefreshAllCoreViews';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import {
  type FieldsConfiguration,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';

type UseSaveFieldsWidgetGroupsParams = {
  pageLayoutId: string;
};

const computeGroupDiff = (
  persistedGroups: FieldsWidgetGroup[],
  draftGroups: FieldsWidgetGroup[],
) => {
  const persistedGroupIds = new Set(persistedGroups.map((g) => g.id));
  const draftGroupIds = new Set(draftGroups.map((g) => g.id));

  const createdGroups = draftGroups.filter((g) => !persistedGroupIds.has(g.id));

  const deletedGroups = persistedGroups.filter((g) => !draftGroupIds.has(g.id));

  const updatedGroups = draftGroups.filter((draftGroup) => {
    if (!persistedGroupIds.has(draftGroup.id)) {
      return false;
    }

    const persistedGroup = persistedGroups.find((g) => g.id === draftGroup.id);

    if (!isDefined(persistedGroup)) {
      return false;
    }

    return (
      persistedGroup.name !== draftGroup.name ||
      persistedGroup.position !== draftGroup.position ||
      persistedGroup.isVisible !== draftGroup.isVisible
    );
  });

  return { createdGroups, deletedGroups, updatedGroups };
};

const computeFieldDiff = (
  persistedGroups: FieldsWidgetGroup[],
  draftGroups: FieldsWidgetGroup[],
) => {
  const fieldUpdates: Array<{
    viewFieldId: string;
    isVisible?: boolean;
    position?: number;
    viewFieldGroupId?: string;
  }> = [];

  // Build a map of persisted fields by their viewFieldId for quick lookup
  const persistedFieldMap = new Map<
    string,
    {
      isVisible: boolean;
      position: number;
      groupId: string;
    }
  >();

  for (const group of persistedGroups) {
    for (const field of group.fields) {
      if (isDefined(field.viewFieldId)) {
        persistedFieldMap.set(field.viewFieldId, {
          isVisible: field.isVisible,
          position: field.position,
          groupId: group.id,
        });
      }
    }
  }

  // Compare each field in the draft against its persisted state
  for (const draftGroup of draftGroups) {
    for (const draftField of draftGroup.fields) {
      if (!isDefined(draftField.viewFieldId)) {
        continue;
      }

      const persistedField = persistedFieldMap.get(draftField.viewFieldId);

      if (!isDefined(persistedField)) {
        continue;
      }

      const hasVisibilityChange =
        persistedField.isVisible !== draftField.isVisible;
      const hasPositionChange = persistedField.position !== draftField.position;
      const hasGroupChange = persistedField.groupId !== draftGroup.id;

      if (hasVisibilityChange || hasPositionChange || hasGroupChange) {
        fieldUpdates.push({
          viewFieldId: draftField.viewFieldId,
          ...(hasVisibilityChange ? { isVisible: draftField.isVisible } : {}),
          ...(hasPositionChange ? { position: draftField.position } : {}),
          ...(hasGroupChange ? { viewFieldGroupId: draftGroup.id } : {}),
        });
      }
    }
  }

  return fieldUpdates;
};

export const useSaveFieldsWidgetGroups = ({
  pageLayoutId,
}: UseSaveFieldsWidgetGroupsParams) => {
  const fieldsWidgetGroupsDraftState = useRecoilComponentCallbackState(
    fieldsWidgetGroupsDraftComponentState,
    pageLayoutId,
  );

  const fieldsWidgetGroupsPersistedState = useRecoilComponentCallbackState(
    fieldsWidgetGroupsPersistedComponentState,
    pageLayoutId,
  );

  const pageLayoutPersistedState = useRecoilComponentCallbackState(
    pageLayoutPersistedComponentState,
    pageLayoutId,
  );

  const {
    performViewFieldGroupAPICreate,
    performViewFieldGroupAPIUpdate,
    performViewFieldGroupAPIDelete,
  } = usePerformViewFieldGroupAPIPersist();

  const { performViewFieldAPIUpdate } = usePerformViewFieldAPIPersist();

  const { refreshAllCoreViews } = useRefreshAllCoreViews();

  const getViewIdForWidget = useRecoilCallback(
    ({ snapshot }) =>
      (widgetId: string): string | null => {
        const pageLayoutPersisted = snapshot
          .getLoadable(pageLayoutPersistedState)
          .getValue();

        if (!isDefined(pageLayoutPersisted)) {
          return null;
        }

        for (const tab of pageLayoutPersisted.tabs) {
          for (const widget of tab.widgets) {
            if (
              widget.id === widgetId &&
              isDefined(widget.configuration) &&
              widget.configuration.configurationType ===
                WidgetConfigurationType.FIELDS
            ) {
              return (
                (widget.configuration as FieldsConfiguration).viewId ?? null
              );
            }
          }
        }

        return null;
      },
    [pageLayoutPersistedState],
  );

  const saveFieldsWidgetGroups = useRecoilCallback(
    ({ set, snapshot }) =>
      async () => {
        const allDraftGroups = snapshot
          .getLoadable(fieldsWidgetGroupsDraftState)
          .getValue();
        const allPersistedGroups = snapshot
          .getLoadable(fieldsWidgetGroupsPersistedState)
          .getValue();

        const widgetIds = new Set([
          ...Object.keys(allDraftGroups),
          ...Object.keys(allPersistedGroups),
        ]);

        for (const widgetId of widgetIds) {
          const draftGroups = allDraftGroups[widgetId] ?? [];
          const persistedGroups = allPersistedGroups[widgetId] ?? [];

          if (draftGroups.length === 0 && persistedGroups.length === 0) {
            continue;
          }

          const viewId = getViewIdForWidget(widgetId);

          if (!isDefined(viewId)) {
            continue;
          }

          // Compute group-level diffs
          const { createdGroups, deletedGroups, updatedGroups } =
            computeGroupDiff(persistedGroups, draftGroups);

          // Create new groups
          if (createdGroups.length > 0) {
            await performViewFieldGroupAPICreate({
              inputs: createdGroups.map((group) => ({
                id: group.id,
                name: group.name,
                position: group.position,
                isVisible: group.isVisible,
                viewId,
              })),
            });
          }

          // Delete removed groups
          if (deletedGroups.length > 0) {
            for (const group of deletedGroups) {
              await performViewFieldGroupAPIDelete([
                { input: { id: group.id } },
              ]);
            }
          }

          // Update modified groups
          if (updatedGroups.length > 0) {
            const updates = updatedGroups.map((group) => ({
              input: {
                id: group.id,
                update: {
                  name: group.name,
                  position: group.position,
                  isVisible: group.isVisible,
                },
              },
            }));

            await performViewFieldGroupAPIUpdate(updates);
          }

          // Compute and apply field-level diffs
          const fieldUpdates = computeFieldDiff(persistedGroups, draftGroups);

          if (fieldUpdates.length > 0) {
            const viewFieldUpdateInputs = fieldUpdates.map(
              ({ viewFieldId, ...updates }) => ({
                input: {
                  id: viewFieldId,
                  update: updates,
                },
              }),
            );

            await performViewFieldAPIUpdate(viewFieldUpdateInputs);
          }
        }

        // After successful save, update persisted state to match draft
        set(fieldsWidgetGroupsPersistedState, allDraftGroups);

        await refreshAllCoreViews();

        return { status: 'successful' as const };
      },
    [
      fieldsWidgetGroupsDraftState,
      fieldsWidgetGroupsPersistedState,
      getViewIdForWidget,
      performViewFieldGroupAPICreate,
      performViewFieldGroupAPIDelete,
      performViewFieldGroupAPIUpdate,
      performViewFieldAPIUpdate,
      refreshAllCoreViews,
    ],
  );

  return { saveFieldsWidgetGroups };
};
