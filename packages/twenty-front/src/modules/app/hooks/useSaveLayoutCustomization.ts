import { useExitLayoutCustomizationMode } from '@/app/hooks/useExitLayoutCustomizationMode';
import { touchedPageLayoutIdsState } from '@/app/states/touchedPageLayoutIdsState';
import { useSaveNavigationMenuItemsDraft } from '@/navigation-menu-item/hooks/useSaveNavigationMenuItemsDraft';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { filterWorkspaceNavigationMenuItems } from '@/navigation-menu-item/utils/filterWorkspaceNavigationMenuItems';
import { prefetchNavigationMenuItemsState } from '@/prefetch/states/prefetchNavigationMenuItemsState';
import { UPSERT_FIELDS_WIDGET } from '@/page-layout/graphql/mutations/upsertFieldsWidget';
import { useUpdatePageLayoutWithTabsAndWidgets } from '@/page-layout/hooks/useUpdatePageLayoutWithTabsAndWidgets';
import { fieldsWidgetEditorModeDraftComponentState } from '@/page-layout/states/fieldsWidgetEditorModeDraftComponentState';
import { fieldsWidgetEditorModePersistedComponentState } from '@/page-layout/states/fieldsWidgetEditorModePersistedComponentState';
import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetGroupsPersistedComponentState } from '@/page-layout/states/fieldsWidgetGroupsPersistedComponentState';
import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { fieldsWidgetUngroupedFieldsPersistedComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsPersistedComponentState';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { convertPageLayoutDraftToUpdateInput } from '@/page-layout/utils/convertPageLayoutDraftToUpdateInput';
import { convertPageLayoutToTabLayouts } from '@/page-layout/utils/convertPageLayoutToTabLayouts';
import { reInjectDynamicRelationWidgetsFromDraft } from '@/page-layout/utils/reInjectDynamicRelationWidgetsFromDraft';
import { transformPageLayout } from '@/page-layout/utils/transformPageLayout';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRefreshAllCoreViews } from '@/views/hooks/useRefreshAllCoreViews';
import { useMutation } from '@apollo/client';
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useCallback, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutType } from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { logError } from '~/utils/logError';

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

export const useSaveLayoutCustomization = () => {
  const [isSaving, setIsSaving] = useState(false);
  const store = useStore();
  const { t } = useLingui();

  const { saveDraft } = useSaveNavigationMenuItemsDraft();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { updatePageLayoutWithTabsAndWidgets } =
    useUpdatePageLayoutWithTabsAndWidgets();
  const { refreshAllCoreViews } = useRefreshAllCoreViews();
  const { exitLayoutCustomizationMode } = useExitLayoutCustomizationMode();

  const [upsertFieldsWidgetMutation] = useMutation<
    { upsertFieldsWidget: unknown },
    { input: UpsertFieldsWidgetInput }
  >(UPSERT_FIELDS_WIDGET);

  const saveFieldsWidgetGroupsForPageLayout = useCallback(
    async (pageLayoutId: string) => {
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
    [store, upsertFieldsWidgetMutation],
  );

  const save = useCallback(async () => {
    setIsSaving(true);
    try {
      // Read navigation dirty state from store at call time to avoid
      // stale closure — the hook-level isDirty can go stale between renders.
      const navigationDraft = store.get(navigationMenuItemsDraftState.atom);
      const prefetchItems = store.get(prefetchNavigationMenuItemsState.atom);
      const workspaceItems = filterWorkspaceNavigationMenuItems(prefetchItems);
      const isNavigationDirty =
        isDefined(navigationDraft) &&
        !isDeeplyEqual(navigationDraft, workspaceItems);

      // TODO: navigation and page layout saves should ideally be atomic —
      // if navigation succeeds but page layouts fail, the user is left in
      // a partially saved state.
      if (isNavigationDirty) {
        await saveDraft();
      }

      const touchedIds = store.get(touchedPageLayoutIdsState.atom);
      let hasAnyFailure = false;

      for (const pageLayoutId of touchedIds) {
        const draft = store.get(
          pageLayoutDraftComponentState.atomFamily({
            instanceId: pageLayoutId,
          }),
        );

        const persisted = store.get(
          pageLayoutPersistedComponentState.atomFamily({
            instanceId: pageLayoutId,
          }),
        );

        if (!isDefined(draft) || !isDefined(persisted)) {
          continue;
        }

        // Project persisted to draft shape for comparison — persisted has
        // extra keys (createdAt, updatedAt, etc.) that draft omits.
        const persistedAsDraft = {
          id: persisted.id,
          name: persisted.name,
          type: persisted.type,
          objectMetadataId: persisted.objectMetadataId,
          tabs: persisted.tabs,
        };

        const isPageLayoutStructureDirty = !isDeeplyEqual(
          draft,
          persistedAsDraft,
        );

        // Save page layout structure only if it changed
        if (isPageLayoutStructureDirty) {
          const updateInput = convertPageLayoutDraftToUpdateInput(draft);
          const result = await updatePageLayoutWithTabsAndWidgets(
            pageLayoutId,
            updateInput,
          );

          if (result.status === 'successful') {
            const updatedPageLayout =
              result.response.data?.updatePageLayoutWithTabsAndWidgets;

            if (isDefined(updatedPageLayout)) {
              const persistedLayout: PageLayout =
                transformPageLayout(updatedPageLayout);

              const pageLayoutToPersist =
                persistedLayout.type === PageLayoutType.RECORD_PAGE
                  ? reInjectDynamicRelationWidgetsFromDraft(
                      persistedLayout,
                      draft,
                    )
                  : persistedLayout;

              store.set(
                pageLayoutPersistedComponentState.atomFamily({
                  instanceId: pageLayoutId,
                }),
                pageLayoutToPersist,
              );
              store.set(
                pageLayoutCurrentLayoutsComponentState.atomFamily({
                  instanceId: pageLayoutId,
                }),
                convertPageLayoutToTabLayouts(pageLayoutToPersist),
              );
            }
          } else {
            // Inner hook already showed an error toast — don't throw to
            // avoid a second toast. Continue saving remaining layouts.
            hasAnyFailure = true;
            continue;
          }
        }

        // Save fields widget groups independently — field edits live in
        // separate atom families and must persist even when the page
        // layout structure itself hasn't changed.
        await saveFieldsWidgetGroupsForPageLayout(pageLayoutId);
      }

      if (hasAnyFailure) {
        return;
      }

      exitLayoutCustomizationMode();
      await refreshAllCoreViews();
    } catch (error) {
      logError(error);
      enqueueErrorSnackBar({
        message: t`Failed to save layout customization`,
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    saveDraft,
    updatePageLayoutWithTabsAndWidgets,
    saveFieldsWidgetGroupsForPageLayout,
    refreshAllCoreViews,
    exitLayoutCustomizationMode,
    enqueueErrorSnackBar,
    store,
    t,
  ]);

  return { save, isSaving };
};
