import { hasObjectMetadataItemPositionField } from '@/object-metadata/utils/hasObjectMetadataItemPositionField';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { useRecordCalendarQueryDateRangeFilter } from '@/object-record/record-calendar/month/hooks/useRecordCalendarQueryDateRangeFilter';
import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { recordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/recordCalendarSelectedDateComponentState';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { type RecordGqlOperationOrderBy } from 'twenty-shared/types';

export const RecordCalendarSSESubscribeEffect = () => {
  const recordCalendarId = useAvailableComponentInstanceIdOrThrow(
    RecordCalendarComponentInstanceContext,
  );
  const { objectMetadataItem } = useRecordCalendarContextOrThrow();
  const recordCalendarSelectedDate = useAtomComponentStateValue(
    recordCalendarSelectedDateComponentState,
  );
  const { dateRangeFilter } = useRecordCalendarQueryDateRangeFilter(
    recordCalendarSelectedDate,
  );

  const orderBy: RecordGqlOperationOrderBy =
    !objectMetadataItem.isRemote &&
    hasObjectMetadataItemPositionField(objectMetadataItem)
      ? [
          {
            position: 'AscNullsFirst',
          },
        ]
      : [];

  const queryId = `record-calendar-${recordCalendarId}`;

  useListenToEventsForQuery({
    queryId,
    operationSignature: {
      objectNameSingular: objectMetadataItem.nameSingular,
      variables: {
        filter: dateRangeFilter,
        orderBy,
      },
    },
  });

  return null;
};
