import { useStore } from 'jotai';
import { useCallback } from 'react';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { engineCommandExecutionContextComponentState } from '@/command-menu-item/engine-command/states/engineCommandExecutionContextComponentState';
import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { isDefined } from 'twenty-shared/utils';

export const usePopulateEngineCommandExecutionContext = () => {
  const store = useStore();

  const populateEngineCommandExecutionContext = useCallback(
    (commandId: string, contextStoreInstanceId: string) => {
      const objectMetadataItemId = store.get(
        contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
          instanceId: contextStoreInstanceId,
        }),
      );

      const objectMetadataItems = store.get(objectMetadataItemsState.atom);
      const objectMetadataItem = objectMetadataItems.find(
        (item) => item.id === objectMetadataItemId,
      );

      const currentViewId = store.get(
        contextStoreCurrentViewIdComponentState.atomFamily({
          instanceId: contextStoreInstanceId,
        }),
      );

      const targetedRecordsRule = store.get(
        contextStoreTargetedRecordsRuleComponentState.atomFamily({
          instanceId: contextStoreInstanceId,
        }),
      );

      const selectedRecordIds =
        targetedRecordsRule.mode === 'selection'
          ? targetedRecordsRule.selectedRecordIds
          : [];

      const recordId =
        targetedRecordsRule.mode === 'selection' &&
        targetedRecordsRule.selectedRecordIds.length === 1
          ? targetedRecordsRule.selectedRecordIds[0]
          : null;

      const selectedRecords = selectedRecordIds
        .map((id) => store.get(recordStoreFamilyState.atomFamily(id)))
        .filter(isDefined);

      const filters = store.get(
        contextStoreFiltersComponentState.atomFamily({
          instanceId: contextStoreInstanceId,
        }),
      );

      const filterGroups = store.get(
        contextStoreFilterGroupsComponentState.atomFamily({
          instanceId: contextStoreInstanceId,
        }),
      );

      const anyFieldFilterValue = store.get(
        contextStoreAnyFieldFilterValueComponentState.atomFamily({
          instanceId: contextStoreInstanceId,
        }),
      );

      const currentUser = store.get(currentUserState.atom);
      const currentWorkspaceMember = store.get(
        currentWorkspaceMemberState.atom,
      );
      const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const userTimezone =
        currentWorkspaceMember?.timeZone !== 'system'
          ? (currentWorkspaceMember?.timeZone ?? systemTimeZone)
          : systemTimeZone;

      const graphqlFilter = isDefined(objectMetadataItem)
        ? computeContextStoreFilters({
            contextStoreTargetedRecordsRule: targetedRecordsRule,
            contextStoreFilters: filters,
            contextStoreFilterGroups: filterGroups,
            objectMetadataItem,
            filterValueDependencies: {
              currentWorkspaceMemberId: currentWorkspaceMember?.id,
              timeZone: userTimezone,
            },
            contextStoreAnyFieldFilterValue: anyFieldFilterValue,
          })
        : null;

      const recordIndexId =
        objectMetadataItem && currentViewId
          ? getRecordIndexIdFromObjectNamePluralAndViewId(
              objectMetadataItem.namePlural,
              currentViewId,
            )
          : null;

      store.set(
        engineCommandExecutionContextComponentState.atomFamily({
          instanceId: commandId,
        }),
        {
          commandId,
          userId: currentUser?.id ?? null,
          recordId,
          objectMetadataItem,
          contextStoreInstanceId,
          currentViewId,
          recordIndexId,
          targetedRecordsRule,
          selectedRecordIds,
          selectedRecords,
          filters,
          filterGroups,
          anyFieldFilterValue,
          graphqlFilter,
        },
      );
    },
    [store],
  );

  return populateEngineCommandExecutionContext;
};
