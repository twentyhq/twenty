import { isRecordFilterAboutSoftDelete } from '@/object-record/record-filter/utils/isRecordFilterAboutSoftDelete';
import type { Store } from 'jotai/vanilla/store';

import { type HeadlessEngineCommandContextApi } from '@/command-menu-item/engine-command/types/HeadlessCommandContextApi';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { computeContextStoreGraphqlFilterFromStore } from '@/context-store/utils/computeContextStoreGraphqlFilterFromStore';
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
  navigationTargetObjectMetadataId,
  creationTargetObjectMetadataId,
  isInSidePanel,
}: {
  store: Store;
  contextStoreInstanceId: string;
  engineComponentKey: EngineComponentKey;
  payload?: CommandMenuItemPayload | null;
  navigationTargetObjectMetadataId?: string | null;
  creationTargetObjectMetadataId?: string;
  isInSidePanel?: boolean;
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

  const graphqlFilter = computeContextStoreGraphqlFilterFromStore({
    store,
    contextStoreInstanceId,
  });

  const recordIndexId =
    objectMetadataItem && currentViewId
      ? getRecordIndexIdFromObjectNamePluralAndViewId(
          objectMetadataItem.namePlural,
          currentViewId,
        )
      : null;

  return {
    engineComponentKey,
    hasAnySoftDeleteFilterOnView: filters.some((recordFilter) =>
      isRecordFilterAboutSoftDelete({ recordFilter, objectMetadataItems }),
    ),
    contextStoreInstanceId,
    objectMetadataItem: objectMetadataItem ?? null,
    currentViewId,
    recordIndexId,
    targetedRecordsRule,
    selectedRecords,
    graphqlFilter,
    payload: payload ?? null,
    navigationTargetObjectMetadataId: navigationTargetObjectMetadataId ?? null,
    creationTargetObjectMetadataId,
    isInSidePanel: isInSidePanel ?? false,
  };
};
