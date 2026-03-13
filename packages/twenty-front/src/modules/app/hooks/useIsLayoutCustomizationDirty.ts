import { recordLayoutDraftStoreByPageLayoutIdState } from '@/app/states/recordLayoutDraftStoreByPageLayoutIdState';
import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/hooks/useNavigationMenuItemsDraftState';
import { fieldsWidgetGroupsPersistedComponentState } from '@/page-layout/states/fieldsWidgetGroupsPersistedComponentState';
import { fieldsWidgetUngroupedFieldsPersistedComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsPersistedComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { atom, useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useIsLayoutCustomizationDirty = () => {
  const { isDirty: isNavigationDirty } = useNavigationMenuItemsDraftState();

  // Derived atom that reactively subscribes to the per-layout draft registry
  // and relevant persisted atoms. Jotai tracks every get() call as a
  // dependency and re-evaluates when any of them changes.
  const isAnyPageLayoutDirtyAtom = useMemo(
    () =>
      atom((get) => {
        const recordLayoutDraftStoreByPageLayoutId = get(
          recordLayoutDraftStoreByPageLayoutIdState.atom,
        );

        for (const [pageLayoutId, recordLayoutDraftEntry] of Object.entries(
          recordLayoutDraftStoreByPageLayoutId,
        )) {
          const draft = recordLayoutDraftEntry.pageLayoutDraft;

          const persisted = get(
            pageLayoutPersistedComponentState.atomFamily({
              instanceId: pageLayoutId,
            }),
          );

          if (!isDefined(draft) || !isDefined(persisted)) {
            continue;
          }

          // Project persisted to draft shape — persisted has extra keys
          // (createdAt, updatedAt, etc.) that draft omits.
          const persistedAsDraft = {
            id: persisted.id,
            name: persisted.name,
            type: persisted.type,
            objectMetadataId: persisted.objectMetadataId,
            tabs: persisted.tabs,
          };

          if (!isDeeplyEqual(draft, persistedAsDraft)) {
            return true;
          }

          // Check field widget dirtiness — field edits live in separate
          // atom families from the page layout structure.
          const fieldsWidgetGroupsDraft =
            recordLayoutDraftEntry.fieldsWidgetGroupsDraft;
          const fieldsWidgetGroupsPersisted = get(
            fieldsWidgetGroupsPersistedComponentState.atomFamily({
              instanceId: pageLayoutId,
            }),
          );

          if (
            !isDeeplyEqual(fieldsWidgetGroupsDraft, fieldsWidgetGroupsPersisted)
          ) {
            return true;
          }

          const ungroupedFieldsDraft =
            recordLayoutDraftEntry.fieldsWidgetUngroupedFieldsDraft;
          const ungroupedFieldsPersisted = get(
            fieldsWidgetUngroupedFieldsPersistedComponentState.atomFamily({
              instanceId: pageLayoutId,
            }),
          );

          if (!isDeeplyEqual(ungroupedFieldsDraft, ungroupedFieldsPersisted)) {
            return true;
          }
        }

        return false;
      }),
    [],
  );

  const isAnyPageLayoutDirty = useAtomValue(isAnyPageLayoutDirtyAtom);

  return { isDirty: isNavigationDirty || isAnyPageLayoutDirty };
};
