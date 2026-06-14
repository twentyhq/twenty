import { useSaveCommandMenuItemsDraft } from '@/command-menu-item/edit/hooks/useSaveCommandMenuItemsDraft';
import { useCommandMenuItemsDraftState } from '@/command-menu-item/hooks/useCommandMenuItemsDraftState';
import { useExitLayoutCustomizationMode } from '@/layout-customization/hooks/useExitLayoutCustomizationMode';
import { activeCustomizationPageLayoutIdsState } from '@/layout-customization/states/activeCustomizationPageLayoutIdsState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/common/states/navigationMenuItemsDraftState';
import { navigationMenuItemsSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsSelector';
import { filterWorkspaceNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterWorkspaceNavigationMenuItems';
import { useSaveNavigationMenuItemsDraft } from '@/navigation-menu-item/edit/hooks/useSaveNavigationMenuItemsDraft';
import { useCreatePendingFieldsWidgetViews } from '@/page-layout/hooks/useCreatePendingFieldsWidgetViews';
import { useCreatePendingRecordTableWidgetViews } from '@/page-layout/hooks/useCreatePendingRecordTableWidgetViews';
import { useSavePageLayoutWidgetsData } from '@/page-layout/hooks/useSavePageLayoutWidgetsData';
import { useUpdatePageLayoutWithTabsAndWidgets } from '@/page-layout/hooks/useUpdatePageLayoutWithTabsAndWidgets';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { convertPageLayoutDraftToUpdateInput } from '@/page-layout/utils/convertPageLayoutDraftToUpdateInput';
import { convertPageLayoutToTabLayouts } from '@/page-layout/utils/convertPageLayoutToTabLayouts';
import { isDefaultPageLayoutId } from '@/page-layout/utils/isDefaultPageLayoutId';
import { transformPageLayout } from '@/page-layout/utils/transformPageLayout';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useCallback, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { logError } from '~/utils/logError';

export const useSaveLayoutCustomization = () => {
  const [isSaving, setIsSaving] = useState(false);
  const store = useStore();
  const { t } = useLingui();

  const { saveDraft } = useSaveNavigationMenuItemsDraft();
  const { saveCommandMenuItemsDraft } = useSaveCommandMenuItemsDraft();
  const { isDirty: isCommandMenuItemsDirty } = useCommandMenuItemsDraftState();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { updatePageLayoutWithTabsAndWidgets } =
    useUpdatePageLayoutWithTabsAndWidgets();
  const { createPendingFieldsWidgetViews } =
    useCreatePendingFieldsWidgetViews();
  const { createPendingRecordTableWidgetViews } =
    useCreatePendingRecordTableWidgetViews();
  const { exitLayoutCustomizationMode } = useExitLayoutCustomizationMode();
  const { savePageLayoutWidgetsData } = useSavePageLayoutWidgetsData();

  const save = useCallback(async () => {
    setIsSaving(true);
    try {
      const navigationDraft = store.get(navigationMenuItemsDraftState.atom);
      const prefetchItems = store.get(navigationMenuItemsSelector.atom);
      const workspaceItems = filterWorkspaceNavigationMenuItems(prefetchItems);
      const isNavigationDirty =
        isDefined(navigationDraft) &&
        !isDeeplyEqual(navigationDraft, workspaceItems);

      // TODO: consider a single server mutation (e.g. saveLayoutCustomization)
      // that saves navigation + page layouts + field widgets in one transaction.
      // Currently, partial failure leaves mixed state — navigation may commit
      // while page layouts fail.
      if (isNavigationDirty) {
        await saveDraft();
      }

      if (isCommandMenuItemsDirty) {
        await saveCommandMenuItemsDraft();
      }

      const activePageLayoutIds = store.get(
        activeCustomizationPageLayoutIdsState.atom,
      );
      let hasAnyFailure = false;

      for (const pageLayoutId of activePageLayoutIds) {
        if (isDefaultPageLayoutId(pageLayoutId)) {
          continue;
        }

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

        const persistedAsDraft: DraftPageLayout = {
          id: persisted.id,
          name: persisted.name,
          type: persisted.type,
          objectMetadataId: persisted.objectMetadataId,
          tabs: persisted.tabs,
          defaultTabToFocusOnMobileAndSidePanelId:
            persisted.defaultTabToFocusOnMobileAndSidePanelId,
        };

        const isPageLayoutStructureDirty = !isDeeplyEqual(
          draft,
          persistedAsDraft,
        );

        await createPendingFieldsWidgetViews(pageLayoutId);
        await createPendingRecordTableWidgetViews(pageLayoutId);

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

              store.set(
                pageLayoutPersistedComponentState.atomFamily({
                  instanceId: pageLayoutId,
                }),
                persistedLayout,
              );
              store.set(
                pageLayoutCurrentLayoutsComponentState.atomFamily({
                  instanceId: pageLayoutId,
                }),
                convertPageLayoutToTabLayouts(persistedLayout),
              );
            }
          } else {
            // goes away with a single server mutation (see TODO above)
            hasAnyFailure = true;
            continue;
          }
        }

        await savePageLayoutWidgetsData(pageLayoutId);
      }

      if (hasAnyFailure) {
        enqueueErrorSnackBar({
          message: t`Some layout changes could not be saved`,
        });
        return;
      }

      exitLayoutCustomizationMode();
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
    saveCommandMenuItemsDraft,
    isCommandMenuItemsDirty,
    createPendingFieldsWidgetViews,
    createPendingRecordTableWidgetViews,
    updatePageLayoutWithTabsAndWidgets,
    savePageLayoutWidgetsData,
    exitLayoutCustomizationMode,
    enqueueErrorSnackBar,
    store,
    t,
  ]);

  return { save, isSaving };
};
