import { RecordCalendarContainer } from '@/object-record/record-calendar/components/RecordCalendarContainer';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { isDefined } from 'twenty-shared/utils';

export const RecordIndexCalendarContainer = () => {
  const { objectNameSingular, viewBarInstanceId } =
    useRecordIndexContextOrThrow();

  const { currentView } = useGetCurrentViewOnly();

  if (
    !isDefined(currentView) ||
    !isDefined(currentView.calendarFieldMetadataId)
  ) {
    return null;
  }

  return (
    <RecordCalendarContainer
      objectNameSingular={objectNameSingular}
      viewBarInstanceId={viewBarInstanceId}
    />
  );
};
