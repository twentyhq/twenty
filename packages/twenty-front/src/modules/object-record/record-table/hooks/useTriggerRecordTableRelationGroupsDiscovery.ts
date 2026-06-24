import { useCallback, useMemo } from 'react';
import { type RecordGqlOperationGqlRecordFields } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { generateDepthRecordGqlFieldsFromFields } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromFields';
import { useSetRecordGroups } from '@/object-record/record-group/hooks/useSetRecordGroups';
import { recordGroupDefinitionsComponentSelector } from '@/object-record/record-group/states/selectors/recordGroupDefinitionsComponentSelector';
import { mergeRelationRecordGroupDefinitions } from '@/object-record/record-group/utils/mergeRelationRecordGroupDefinitions';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexGroupsRecordsLazyGroupBy } from '@/object-record/record-index/hooks/useRecordIndexGroupsRecordsLazyGroupBy';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordTableRelationGroupsDiscoveredFieldIdComponentState } from '@/object-record/record-table/states/recordTableRelationGroupsDiscoveredFieldIdComponentState';
import { getGroupByQueryResultGqlFieldName } from '@/page-layout/utils/getGroupByQueryResultGqlFieldName';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
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

  const setRecordTableRelationGroupsDiscoveredFieldId =
    useSetAtomComponentState(
      recordTableRelationGroupsDiscoveredFieldIdComponentState,
    );

  const discoveryRecordGqlFields = useMemo<
    RecordGqlOperationGqlRecordFields | undefined
  >(() => {
    if (
      !isDefined(recordIndexGroupFieldMetadataItem) ||
      !isManyToOneRelationField(recordIndexGroupFieldMetadataItem)
    ) {
      return undefined;
    }

    return {
      id: true,
      ...generateDepthRecordGqlFieldsFromFields({
        objectMetadataItems,
        fields: [recordIndexGroupFieldMetadataItem],
        depth: 1,
      }),
    };
  }, [objectMetadataItems, recordIndexGroupFieldMetadataItem]);

  const { executeRecordIndexGroupsRecordsLazyGroupBy } =
    useRecordIndexGroupsRecordsLazyGroupBy({
      groupByFieldMetadataItem: recordIndexGroupFieldMetadataItem,
      objectMetadataItem,
      recordGqlFieldsOverride: discoveryRecordGqlFields,
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
        recordIndexGroupFieldMetadataItem.relation.targetObjectMetadata.id,
    );

    const persistedViewGroups = isDefined(contextStoreCurrentViewId)
      ? (getViewFromState(contextStoreCurrentViewId)?.viewGroups ?? [])
      : [];

    const recordGroups = mergeRelationRecordGroupDefinitions({
      groups,
      relationFieldName: recordIndexGroupFieldMetadataItem.name,
      mainGroupByFieldMetadataId: recordIndexGroupFieldMetadataItem.id,
      targetObjectMetadataItem,
      existingRecordGroupDefinitions: recordGroupDefinitions,
      persistedViewGroups,
    });

    setRecordGroups({
      mainGroupByFieldMetadataId: recordIndexGroupFieldMetadataItem.id,
      recordGroups,
      recordIndexId,
      objectMetadataItemId: objectMetadataItem.id,
    });

    setRecordTableRelationGroupsDiscoveredFieldId(
      recordIndexGroupFieldMetadataItem.id,
    );
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
    setRecordTableRelationGroupsDiscoveredFieldId,
  ]);

  return { triggerRecordTableRelationGroupsDiscovery };
};
