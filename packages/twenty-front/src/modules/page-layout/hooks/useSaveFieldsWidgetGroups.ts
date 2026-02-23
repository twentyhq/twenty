import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetGroupsPersistedComponentState } from '@/page-layout/states/fieldsWidgetGroupsPersistedComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { computeFieldsWidgetFieldDiff } from '@/page-layout/utils/computeFieldsWidgetFieldDiff';
import { computeFieldsWidgetGroupDiff } from '@/page-layout/utils/computeFieldsWidgetGroupDiff';
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

          const { createdGroups, deletedGroups, updatedGroups } =
            computeFieldsWidgetGroupDiff(persistedGroups, draftGroups);

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

          if (deletedGroups.length > 0) {
            for (const group of deletedGroups) {
              await performViewFieldGroupAPIDelete([
                { input: { id: group.id } },
              ]);
            }
          }

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

          const fieldUpdates = computeFieldsWidgetFieldDiff(
            persistedGroups,
            draftGroups,
          );

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
