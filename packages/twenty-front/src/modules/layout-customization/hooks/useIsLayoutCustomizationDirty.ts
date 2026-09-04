import { useCommandMenuItemsDraftState } from '@/command-menu-item/hooks/useCommandMenuItemsDraftState';
import { activeCustomizationPageLayoutIdsState } from '@/layout-customization/states/activeCustomizationPageLayoutIdsState';
import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemsDraftState';
import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetGroupsPersistedComponentState } from '@/page-layout/states/fieldsWidgetGroupsPersistedComponentState';
import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { fieldsWidgetUngroupedFieldsPersistedComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsPersistedComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { recordTableWidgetViewPersistedComponentState } from '@/page-layout/states/recordTableWidgetViewPersistedComponentState';
import { toDraftPageLayout } from '@/page-layout/utils/toDraftPageLayout';
import { atom, useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { useComponentStateSurfaceId } from '@/ui/utilities/state/component-state/hooks/useComponentStateSurfaceId';

export const useIsLayoutCustomizationDirty = () => {
  const surfaceId = useComponentStateSurfaceId();
  const { isDirty: isNavigationDirty } = useNavigationMenuItemsDraftState();
  const { isDirty: isCommandMenuItemsDirty } = useCommandMenuItemsDraftState();

  const isAnyPageLayoutDirtyAtom = useMemo(
    () =>
      atom((get) => {
        const activePageLayoutIds = get(
          activeCustomizationPageLayoutIdsState.atom,
        );

        for (const pageLayoutId of activePageLayoutIds) {
          const draft = get(
            pageLayoutDraftComponentState.atomFamily({
              instanceId: pageLayoutId,
              surfaceId,
            }),
          );

          const persisted = get(
            pageLayoutPersistedComponentState.atomFamily({
              instanceId: pageLayoutId,
              surfaceId,
            }),
          );

          if (!isDefined(draft) || !isDefined(persisted)) {
            continue;
          }

          if (!isDeeplyEqual(draft, toDraftPageLayout(persisted))) {
            return true;
          }

          const fieldsWidgetGroupsDraft = get(
            fieldsWidgetGroupsDraftComponentState.atomFamily({
              instanceId: pageLayoutId,
              surfaceId,
            }),
          );
          const fieldsWidgetGroupsPersisted = get(
            fieldsWidgetGroupsPersistedComponentState.atomFamily({
              instanceId: pageLayoutId,
              surfaceId,
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
              surfaceId,
            }),
          );
          const ungroupedFieldsPersisted = get(
            fieldsWidgetUngroupedFieldsPersistedComponentState.atomFamily({
              instanceId: pageLayoutId,
              surfaceId,
            }),
          );

          if (!isDeeplyEqual(ungroupedFieldsDraft, ungroupedFieldsPersisted)) {
            return true;
          }

          const recordTableWidgetViewDraft = get(
            recordTableWidgetViewDraftComponentState.atomFamily({
              instanceId: pageLayoutId,
              surfaceId,
            }),
          );
          const recordTableWidgetViewPersisted = get(
            recordTableWidgetViewPersistedComponentState.atomFamily({
              instanceId: pageLayoutId,
              surfaceId,
            }),
          );

          if (
            !isDeeplyEqual(
              recordTableWidgetViewDraft,
              recordTableWidgetViewPersisted,
            )
          ) {
            return true;
          }
        }

        return false;
      }),
    [surfaceId],
  );

  const isAnyPageLayoutDirty = useAtomValue(isAnyPageLayoutDirtyAtom);

  return {
    isDirty:
      isNavigationDirty || isAnyPageLayoutDirty || isCommandMenuItemsDirty,
  };
};
