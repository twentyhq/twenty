import type { Store } from 'jotai/vanilla/store';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { type HeadlessEngineCommandContextApi } from '@/command-menu-item/engine-command/types/HeadlessCommandContextApi';
import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { isDefined } from 'twenty-shared/utils';
import {
  type EngineComponentKey,
  type CommandMenuItemPayload,
} from '~/generated-metadata/graphql';

export const buildHeadlessCommandContextApi = ({
  store,
  contextStoreInstanceId,
  engineComponentKey,
  payload,
}: {
  store: Store;
  contextStoreInstanceId: string;
  engineComponentKey: EngineComponentKey;
  payload?: CommandMenuItemPayload | null;
}): HeadlessEngineCommandContextApi => {
  const objectMetadataItemId = store.get(
    contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
      instanceId: contextStoreInstanceId,
    }),
  );

  const objectMetadataItems = store.get(objectMetadataItemsSelector.atom);

  const objectMetadataItem = objectMetadataItems.find(
    (item: EnrichedObjectMetadataItem) => item.id === objectMetadataItemId,
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

  const selectedRecords = (
    targetedRecordsRule.mode === 'selection'
      ? targetedRecordsRule.selectedRecordIds
      : []
  )
    .map((id: string) => store.get(recordStoreFamilyState.atomFamily(id)))
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

  const currentWorkspaceMember = store.get(currentWorkspaceMemberState.atom);

  const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const userTimezone =
    currentWorkspaceMember?.timeZone !== 'system'
      ? (currentWorkspaceMember?.timeZone ?? systemTimeZone)
      : systemTimeZone;

  const flattenedFieldMetadataItems = objectMetadataItems.flatMap(
    (objectMetadataItem) => objectMetadataItem.fields,
  );

  const graphqlFilter = isDefined(objectMetadataItem)
    ? computeContextStoreFilters({
        contextStoreTargetedRecordsRule: targetedRecordsRule,
        contextStoreFilters: filters,
        contextStoreFilterGroups: filterGroups,
        objectMetadataItem,
        flattenedFieldMetadataItems,
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

  return {
    engineComponentKey,
    contextStoreInstanceId,
    objectMetadataItem: objectMetadataItem ?? null,
    currentViewId,
    recordIndexId,
    targetedRecordsRule,
    selectedRecords,
    graphqlFilter,
    payload: payload ?? null,
  };
};
