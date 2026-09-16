import { objectColorsDraftState } from '@/layout-customization/states/objectColorsDraftState';
import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
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
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { convertPageLayoutDraftToUpdateInput } from '@/page-layout/utils/convertPageLayoutDraftToUpdateInput';
import { convertPageLayoutToTabLayouts } from '@/page-layout/utils/convertPageLayoutToTabLayouts';
import { toDraftPageLayout } from '@/page-layout/utils/toDraftPageLayout';
import { transformPageLayout } from '@/page-layout/utils/transformPageLayout';
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useCallback, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/primitives/feedback';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { logError } from '~/utils/logError';

export const useSaveLayoutCustomization = () => {
  const { updateOneObjectMetadataItem, refetchCommandMenuItems } =
    useUpdateOneObjectMetadataItem();
  const [isSaving, setIsSaving] = useState(false);
  const store = useStore();
  const { t } = useLingui();

  const { saveDraft } = useSaveNavigationMenuItemsDraft();
  const { saveCommandMenuItemsDraft } = useSaveCommandMenuItemsDraft();
  const { isDirty: isCommandMenuItemsDirty } = useCommandMenuItemsDraftState();
  const { enqueueToast } = useToast();
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
      const objectColorEntries = Object.entries(
        store.get(objectColorsDraftState.atom),
      );

      if (objectColorEntries.length > 0) {
        // TODO: replace with an updateManyObjectMetadataItems endpoint so this
        // is one request instead of one per object.
        // Each update otherwise refetches the command menu, so send them
        // together and refetch once.
        const colorResults = await Promise.all(
          objectColorEntries.map(async ([objectId, color]) => ({
            objectId,
            color,
            result: await updateOneObjectMetadataItem({
              idToUpdate: objectId,
              updatePayload: { color },
              shouldRefetchCommandMenuItems: false,
            }),
          })),
        );

        const savedColorByObjectId = new Map(
          colorResults
            .filter(({ result }) => result.status === 'successful')
            .map(({ objectId, color }) => [objectId, color]),
        );

        // The picker stays live while these run, so only drop an entry the user
        // has not changed again since it was sent.
        store.set(objectColorsDraftState.atom, (draft) =>
          Object.fromEntries(
            Object.entries(draft).filter(
              ([objectId, color]) =>
                savedColorByObjectId.get(objectId) !== color,
            ),
          ),
        );

        await refetchCommandMenuItems();

        if (savedColorByObjectId.size !== objectColorEntries.length) {
          return;
        }
      }
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

        const isPageLayoutStructureDirty = !isDeeplyEqual(
          draft,
          toDraftPageLayout(persisted),
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
        enqueueToast({
          variant: 'error',
          children: t`Some layout changes could not be saved`,
        });
        return;
      }

      exitLayoutCustomizationMode();
    } catch (error) {
      logError(error);
      enqueueToast({
        variant: 'error',
        children: t`Failed to save layout customization`,
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    updateOneObjectMetadataItem,
    refetchCommandMenuItems,
    saveDraft,
    saveCommandMenuItemsDraft,
    isCommandMenuItemsDirty,
    createPendingFieldsWidgetViews,
    createPendingRecordTableWidgetViews,
    updatePageLayoutWithTabsAndWidgets,
    savePageLayoutWidgetsData,
    exitLayoutCustomizationMode,
    enqueueToast,
    store,
    t,
  ]);

  return { save, isSaving };
};
