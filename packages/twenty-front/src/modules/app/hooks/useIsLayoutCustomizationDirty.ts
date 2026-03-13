import { touchedPageLayoutIdsState } from '@/app/states/touchedPageLayoutIdsState';
import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/hooks/useNavigationMenuItemsDraftState';
import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetGroupsPersistedComponentState } from '@/page-layout/states/fieldsWidgetGroupsPersistedComponentState';
import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { fieldsWidgetUngroupedFieldsPersistedComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsPersistedComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { atom, useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useIsLayoutCustomizationDirty = () => {
  const { isDirty: isNavigationDirty } = useNavigationMenuItemsDraftState();

  // Derived atom that reactively subscribes to all touched page layout
  // draft/persisted atoms via get(). Jotai tracks every get() call as a
  // dependency and re-evaluates when any of them changes.
  const isAnyPageLayoutDirtyAtom = useMemo(
    () =>
      atom((get) => {
        const touchedIds = get(touchedPageLayoutIdsState.atom);

        for (const pageLayoutId of touchedIds) {
          const draft = get(
            pageLayoutDraftComponentState.atomFamily({
              instanceId: pageLayoutId,
            }),
          );

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
          const fieldsWidgetGroupsDraft = get(
            fieldsWidgetGroupsDraftComponentState.atomFamily({
              instanceId: pageLayoutId,
            }),
          );
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

          const ungroupedFieldsDraft = get(
            fieldsWidgetUngroupedFieldsDraftComponentState.atomFamily({
              instanceId: pageLayoutId,
            }),
          );
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
