import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { recordGroupDefinitionsComponentSelector } from '@/object-record/record-group/states/selectors/recordGroupDefinitionsComponentSelector';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useAggregateGqlFieldsFromRecordIndexGroupAggregates } from '@/object-record/record-index/hooks/useAggregateGqlFieldsFromRecordIndexGroupAggregates';
import { useRecordIndexGroupsAggregatesGroupBy } from '@/object-record/record-index/hooks/useRecordIndexGroupsAggregatesGroupBy';
import { useSetRecordIndexAggregateDisplayLabel } from '@/object-record/record-index/hooks/useSetRecordIndexAggregateDisplayLabel';
import { useSetRecordIndexAggregateDisplayValueForRecordGroupValue } from '@/object-record/record-index/hooks/useSetRecordIndexAggregateDisplayValueForRecordGroupValue';

import { recordIndexAggregateDisplayLabelComponentState } from '@/object-record/record-index/states/recordIndexAggregateDisplayLabelComponentState';
import { turnRecordIndexGroupByAggregateQueryResultIntoRecordAggregateValueByGroupValue } from '@/object-record/record-index/utils/turnRecordIndexGroupByAggregateQueryResultIntoRecordAggregateValueByGroupValue';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useEffect } from 'react';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const RecordIndexGroupAggregateQueryEffect = ({
  recordIndexGroupFieldMetadataItem,
  recordIndexGroupAggregateOperation,
  recordIndexGroupAggregateFieldMetadataItem,
}: {
  recordIndexGroupFieldMetadataItem: FieldMetadataItem;
  recordIndexGroupAggregateFieldMetadataItem: Nullable<FieldMetadataItem>;
  recordIndexGroupAggregateOperation: ExtendedAggregateOperations;
}) => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const { data, loading, error } = useRecordIndexGroupsAggregatesGroupBy({
    objectMetadataItem,
    groupByFieldMetadataItem: recordIndexGroupFieldMetadataItem,
    recordIndexGroupAggregateFieldMetadataItem,
    recordIndexGroupAggregateOperation,
  });

  const { recordAggregateGqlField } =
    useAggregateGqlFieldsFromRecordIndexGroupAggregates({
      objectMetadataItem,
      recordIndexGroupAggregateFieldMetadataItem,
      recordIndexGroupAggregateOperation,
    });

  const recordIndexAggregateDisplayLabelCallbackState =
    useRecoilComponentCallbackState(
      recordIndexAggregateDisplayLabelComponentState,
    );

  const { setRecordIndexAggregateDisplayLabel } =
    useSetRecordIndexAggregateDisplayLabel();

  const { setRecordIndexAggregateDisplayValueForRecordGroupValue } =
    useSetRecordIndexAggregateDisplayValueForRecordGroupValue();

  const recordGroupDefinitions = useRecoilComponentValue(
    recordGroupDefinitionsComponentSelector,
  );

  useEffect(() => {
    if (
      !loading &&
      !isDefined(error) &&
      isDefined(data) &&
      isDefined(recordAggregateGqlField)
    ) {
      const { recordAggregateValueByGroupValueArray } =
        turnRecordIndexGroupByAggregateQueryResultIntoRecordAggregateValueByGroupValue(
          {
            objectMetadataItem,
            queryResult: data,
            recordAggregateGqlField,
          },
        );

      if (isDefined(recordIndexGroupAggregateFieldMetadataItem)) {
        setRecordIndexAggregateDisplayLabel(
          recordIndexGroupAggregateOperation,
          recordIndexGroupAggregateFieldMetadataItem,
        );

        for (const recordGroupDefinition of recordGroupDefinitions) {
          const foundAggregateValueForGroup =
            recordAggregateValueByGroupValueArray.find(
              (recordAggregateValueByGroupValue) =>
                recordAggregateValueByGroupValue.recordGroupValue ===
                recordGroupDefinition.value,
            );

          if (isDefined(foundAggregateValueForGroup)) {
            setRecordIndexAggregateDisplayValueForRecordGroupValue(
              recordIndexGroupAggregateOperation,
              recordIndexGroupAggregateFieldMetadataItem,
              foundAggregateValueForGroup.recordGroupValue,
              foundAggregateValueForGroup.recordAggregateValue,
            );
          } else {
            setRecordIndexAggregateDisplayValueForRecordGroupValue(
              recordIndexGroupAggregateOperation,
              recordIndexGroupAggregateFieldMetadataItem,
              recordGroupDefinition.value ?? '',
              0,
            );
          }
        }
      }
    }
  }, [
    data,
    loading,
    error,
    setRecordIndexAggregateDisplayValueForRecordGroupValue,
    setRecordIndexAggregateDisplayLabel,
    recordIndexGroupAggregateFieldMetadataItem,
    recordIndexGroupAggregateOperation,
    recordAggregateGqlField,
    recordIndexAggregateDisplayLabelCallbackState,
    objectMetadataItem,
    recordGroupDefinitions,
  ]);

  return null;
};
