import { isNonEmptyArray } from '@sniptt/guards';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { useSetRecordGroups } from '@/object-record/record-group/hooks/useSetRecordGroups';
import { recordGroupDefinitionsComponentSelector } from '@/object-record/record-group/states/selectors/recordGroupDefinitionsComponentSelector';
import {
  buildRelationRecordGroupDefinitions,
  type RelationRecordGroupOrder,
} from '@/object-record/record-group/utils/buildRelationRecordGroupDefinitions';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexGroupsRecordsLazyGroupBy } from '@/object-record/record-index/hooks/useRecordIndexGroupsRecordsLazyGroupBy';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { getGroupByQueryResultGqlFieldName } from '@/page-layout/utils/getGroupByQueryResultGqlFieldName';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useGetViewFromState } from '@/views/hooks/useGetViewFromState';

export const useTriggerRecordTableRelationGroupsDiscovery = () => {
  const { objectMetadataItem, recordIndexId } = useRecordIndexContextOrThrow();

  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const recordGroupDefinitions = useAtomComponentSelectorValue(
    recordGroupDefinitionsComponentSelector,
  );

  const contextStoreCurrentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
  );

  const { getViewFromState } = useGetViewFromState();

  const { setRecordGroups } = useSetRecordGroups();

  const { executeRecordIndexGroupsRecordsLazyGroupBy } =
    useRecordIndexGroupsRecordsLazyGroupBy({
      groupByFieldMetadataItem: recordIndexGroupFieldMetadataItem,
      objectMetadataItem,
    });

  const triggerRecordTableRelationGroupsDiscovery = useCallback(async () => {
    if (
      !isDefined(recordIndexGroupFieldMetadataItem) ||
      !isManyToOneRelationField(recordIndexGroupFieldMetadataItem)
    ) {
      return;
    }

    const result = await executeRecordIndexGroupsRecordsLazyGroupBy().catch(
      () => null,
    );

    if (!isDefined(result)) {
      return;
    }

    const queryFieldName =
      getGroupByQueryResultGqlFieldName(objectMetadataItem);
    const groups = result.data?.[queryFieldName];

    if (!isDefined(groups)) {
      return;
    }

    const targetObjectMetadataItem = objectMetadataItems.find(
      (item) =>
        item.id ===
        recordIndexGroupFieldMetadataItem.relation?.targetObjectMetadata.id,
    );

    const persistedViewGroups = isDefined(contextStoreCurrentViewId)
      ? (getViewFromState(contextStoreCurrentViewId)?.viewGroups ?? [])
      : [];

    const priorOrder: RelationRecordGroupOrder[] = isNonEmptyArray(
      recordGroupDefinitions,
    )
      ? recordGroupDefinitions.map((definition) => ({
          value: definition.value,
          viewGroupId: definition.viewGroupId,
          isVisible: definition.isVisible,
          position: definition.position,
        }))
      : persistedViewGroups.map((viewGroup) => ({
          value: viewGroup.fieldValue === '' ? null : viewGroup.fieldValue,
          viewGroupId: viewGroup.id,
          isVisible: viewGroup.isVisible,
          position: viewGroup.position,
        }));

    const builtRecordGroups = buildRelationRecordGroupDefinitions({
      groups,
      relationFieldName: recordIndexGroupFieldMetadataItem.name,
      mainGroupByFieldMetadataId: recordIndexGroupFieldMetadataItem.id,
      targetObjectMetadataItem,
      priorOrder,
    });

    const builtRecordGroupValues = new Set(
      builtRecordGroups.map((definition) => definition.value),
    );
    const preservedHiddenRecordGroups = recordGroupDefinitions.filter(
      (definition) =>
        !definition.isVisible && !builtRecordGroupValues.has(definition.value),
    );

    setRecordGroups({
      mainGroupByFieldMetadataId: recordIndexGroupFieldMetadataItem.id,
      recordGroups: [...builtRecordGroups, ...preservedHiddenRecordGroups],
      recordIndexId,
      objectMetadataItemId: objectMetadataItem.id,
    });
  }, [
    contextStoreCurrentViewId,
    executeRecordIndexGroupsRecordsLazyGroupBy,
    getViewFromState,
    objectMetadataItem,
    objectMetadataItems,
    recordGroupDefinitions,
    recordIndexGroupFieldMetadataItem,
    recordIndexId,
    setRecordGroups,
  ]);

  return { triggerRecordTableRelationGroupsDiscovery };
};
