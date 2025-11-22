import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useAggregateGqlFieldsFromRecordIndexGroupAggregates } from '@/object-record/record-index/hooks/useAggregateGqlFieldsFromRecordIndexGroupAggregates';
import { useRecordIndexGroupsAggregatesGroupBy } from '@/object-record/record-index/hooks/useRecordIndexGroupsAggregatesGroupBy';
import { useSetRecordIndexAggregateDisplayLabel } from '@/object-record/record-index/hooks/useSetRecordIndexAggregateDisplayLabel';
import { useSetRecordIndexAggregateDisplayValueForRecordGroupValue } from '@/object-record/record-index/hooks/useSetRecordIndexAggregateDisplayValueForRecordGroupValue';

import { recordIndexAggregateDisplayLabelComponentState } from '@/object-record/record-index/states/recordIndexAggregateDisplayLabelComponentState';
import { turnRecordIndexGroupByAggregateQueryResultIntoRecordAggregateValueByGroupValue } from '@/object-record/record-index/utils/turnRecordIndexGroupByAggregateQueryResultIntoRecordAggregateValueByGroupValue';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
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

        for (const recordAggregateValueByGroupValue of recordAggregateValueByGroupValueArray) {
          setRecordIndexAggregateDisplayValueForRecordGroupValue(
            recordIndexGroupAggregateOperation,
            recordIndexGroupAggregateFieldMetadataItem,
            recordAggregateValueByGroupValue.recordGroupValue,
            recordAggregateValueByGroupValue.recordAggregateValue,
          );
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
  ]);

  return null;
};
