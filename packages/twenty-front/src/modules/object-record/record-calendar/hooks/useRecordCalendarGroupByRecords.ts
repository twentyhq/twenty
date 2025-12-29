import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { hasObjectMetadataItemPositionField } from '@/object-metadata/utils/hasObjectMetadataItemPositionField';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { type RecordGqlOperationOrderBy } from '@/object-record/graphql/types/RecordGqlOperationOrderBy';
import { useGroupByRecordsQuery } from '@/object-record/hooks/useGroupByRecordsQuery';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { useRecordCalendarQueryDateRangeFilter } from '@/object-record/record-calendar/month/hooks/useRecordCalendarQueryDateRangeFilter';
import { useRecordsFieldVisibleGqlFields } from '@/object-record/record-field/hooks/useRecordsFieldVisibleGqlFields';
import { recordIndexCalendarFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexCalendarFieldMetadataIdState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { buildGroupByFieldObject } from '@/page-layout/widgets/graph/utils/buildGroupByFieldObject';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { type Temporal } from 'temporal-polyfill';
import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useRecordCalendarGroupByRecords = (
  selectedDate: Temporal.PlainDate,
) => {
  const { objectMetadataItem } = useRecordCalendarContextOrThrow();

  const { userTimezone } = useUserTimezone();

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

  const groupBy = !isDefined(calendarFieldMetadataItem)
    ? []
    : [
        buildGroupByFieldObject({
          field: calendarFieldMetadataItem,
          dateGranularity: ObjectRecordGroupByDateGranularity.DAY,
          timeZone: userTimezone,
        }),
      ];

  const orderByForRecords: RecordGqlOperationOrderBy | undefined =
    !objectMetadataItem.isRemote &&
    hasObjectMetadataItemPositionField(objectMetadataItem)
      ? [
          {
            position: 'AscNullsFirst',
          },
        ]
      : undefined;

  const { groupByRecordsQuery } = useGroupByRecordsQuery({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordGqlFields,
    computeReferences: false,
  });

  const apolloCoreClient = useApolloCoreClient();

  const { data, loading, error } = useQuery(groupByRecordsQuery, {
    client: apolloCoreClient,
    skip:
      !isDefined(calendarFieldMetadataItem) ||
      groupBy.length === 0 ||
      Object.keys(dateRangeFilter).length === 0,
    fetchPolicy: 'cache-and-network',
    variables: {
      groupBy,
      filter: dateRangeFilter,
      orderByForRecords,
    },
  });

  const groupByResults = data?.[`${objectMetadataItem.namePlural}GroupBy`];

  const records: ObjectRecord[] = useMemo(() => {
    if (!isDefined(groupByResults)) {
      return [];
    }

    const allRecords = groupByResults.flatMap((group: any) =>
      getRecordsFromRecordConnection<ObjectRecord>({
        recordConnection: group,
      }),
    );

    // Deduplicate records by ID to prevent duplicate keys in React
    const uniqueRecordsMap = new Map<string, ObjectRecord>();
    allRecords.forEach((record: ObjectRecord) => {
      if (!uniqueRecordsMap.has(record.id)) {
        uniqueRecordsMap.set(record.id, record);
      }
    });

    return Array.from(uniqueRecordsMap.values());
  }, [groupByResults]);

  const groupByDimensionValues = useMemo(
    () =>
      !isDefined(groupByResults)
        ? []
        : groupByResults.flatMap(
            (group: any) => group.groupByDimensionValues || [],
          ),
    [groupByResults],
  );

  return {
    records,
    groupByDimensionValues,
    loading,
    error,
    calendarFieldMetadataItem,
  };
};
