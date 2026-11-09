import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { recordGroupTabRecordCountByGroupIdComponentState } from '@/object-record/record-group/states/recordGroupTabRecordCountByGroupIdComponentState';
import { recordGroupDefinitionsComponentSelector } from '@/object-record/record-group/states/selectors/recordGroupDefinitionsComponentSelector';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexGroupsAggregatesGroupBy } from '@/object-record/record-index/hooks/useRecordIndexGroupsAggregatesGroupBy';
import { turnRecordIndexGroupByAggregateQueryResultIntoRecordAggregateValueByGroupValue } from '@/object-record/record-index/utils/turnRecordIndexGroupByAggregateQueryResultIntoRecordAggregateValueByGroupValue';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

const COUNT_GQL_FIELD = 'totalCount';

type RecordGroupTabsRecordCountsEffectProps = {
  groupByFieldMetadataItem: FieldMetadataItem;
};

// Hide empty groups cannot rely on loaded rows while the All tab shows the view ungrouped
export const RecordGroupTabsRecordCountsEffect = ({
  groupByFieldMetadataItem,
}: RecordGroupTabsRecordCountsEffectProps) => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const { data, loading, error } = useRecordIndexGroupsAggregatesGroupBy({
    objectMetadataItem,
    groupByFieldMetadataItem,
    recordIndexGroupAggregateFieldMetadataItem: null,
    recordIndexGroupAggregateOperation: AggregateOperations.COUNT,
  });

  const recordGroupDefinitions = useAtomComponentSelectorValue(
    recordGroupDefinitionsComponentSelector,
  );

  const setRecordGroupTabRecordCountByGroupId = useSetAtomComponentState(
    recordGroupTabRecordCountByGroupIdComponentState,
  );

  useEffect(() => {
    if (loading || isDefined(error) || !isDefined(data)) {
      return;
    }

    const { recordAggregateValueByGroupValueArray } =
      turnRecordIndexGroupByAggregateQueryResultIntoRecordAggregateValueByGroupValue(
        {
          objectMetadataItem,
          queryResult: data,
          recordAggregateGqlField: COUNT_GQL_FIELD,
        },
      );

    setRecordGroupTabRecordCountByGroupId(
      Object.fromEntries(
        recordGroupDefinitions.map((recordGroupDefinition) => [
          recordGroupDefinition.id,
          Number(
            recordAggregateValueByGroupValueArray.find(
              ({ recordGroupValue }) =>
                recordGroupValue === recordGroupDefinition.value,
            )?.recordAggregateValue ?? 0,
          ),
        ]),
      ),
    );
  }, [
    data,
    error,
    loading,
    objectMetadataItem,
    recordGroupDefinitions,
    setRecordGroupTabRecordCountByGroupId,
  ]);

  return null;
};
