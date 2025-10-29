import { hasObjectMetadataItemPositionField } from '@/object-metadata/utils/hasObjectMetadataItemPositionField';
import { type RecordGqlOperationOrderBy } from '@/object-record/graphql/types/RecordGqlOperationOrderBy';
import { useGroupByRecords } from '@/object-record/hooks/useGroupByRecords';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { useRecordCalendarQueryDateRangeFilter } from '@/object-record/record-calendar/month/hooks/useRecordCalendarQueryDateRangeFilter';
import { useRecordsFieldVisibleGqlFields } from '@/object-record/record-field/hooks/useRecordsFieldVisibleGqlFields';
import { recordIndexCalendarFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexCalendarFieldMetadataIdState';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useRecordCalendarGroupByRecords = (selectedDate: Date) => {
  const { objectMetadataItem } = useRecordCalendarContextOrThrow();

  const recordIndexCalendarFieldMetadataId = useRecoilValue(
    recordIndexCalendarFieldMetadataIdState,
  );

  const recordGqlFields = useRecordsFieldVisibleGqlFields({
    objectMetadataItem,
    additionalFieldMetadataId: recordIndexCalendarFieldMetadataId,
  });

  const { dateRangeFilter } =
    useRecordCalendarQueryDateRangeFilter(selectedDate);

  const calendarFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === recordIndexCalendarFieldMetadataId,
  );

  const computeGroupBy = () => {
    if (!isDefined(calendarFieldMetadataItem)) {
      return [];
    }

    if (
      calendarFieldMetadataItem.type === 'DATE' ||
      calendarFieldMetadataItem.type === 'DATE_TIME'
    ) {
      return [
        {
          [calendarFieldMetadataItem.name]: {
            granularity: 'DAY',
          },
        },
      ];
    }

    return [
      {
        [calendarFieldMetadataItem.name]: true,
      },
    ];
  };

  const computedGroupBy = computeGroupBy();

  const shouldSkip =
    !isDefined(calendarFieldMetadataItem) || computedGroupBy.length === 0;

  const orderByForRecords: RecordGqlOperationOrderBy | undefined =
    useMemo(() => {
      if (
        !objectMetadataItem.isRemote &&
        hasObjectMetadataItemPositionField(objectMetadataItem)
      ) {
        return [
          {
            position: 'AscNullsFirst',
          },
        ];
      }
      return undefined;
    }, [objectMetadataItem]);

  const { records, groupByDimensionValues, loading, error } = useGroupByRecords(
    {
      objectNameSingular: objectMetadataItem.nameSingular,
      groupBy: computedGroupBy,
      filter: dateRangeFilter,
      recordGqlFields,
      orderByForRecords,
      skip: shouldSkip,
    },
  );

  return {
    records,
    groupByDimensionValues,
    loading,
    error,
    calendarFieldMetadataItem,
  };
};
