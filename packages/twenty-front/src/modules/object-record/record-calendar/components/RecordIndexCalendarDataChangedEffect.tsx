import { useRecordCalendarGroupByRecords } from '@/object-record/record-calendar/hooks/useRecordCalendarGroupByRecords';
import { recordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/recordCalendarSelectedDateComponentState';
import { recordCalendarShouldBeRefetchedComponentState } from '@/object-record/record-calendar/states/recordCalendarShouldBeRefetchedComponentState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useEffect } from 'react';

export const RecordIndexCalendarDataChangedEffect = () => {
  const recordCalendarSelectedDate = useRecoilComponentValue(
    recordCalendarSelectedDateComponentState,
  );

  const { refetch, loading } = useRecordCalendarGroupByRecords(
    recordCalendarSelectedDate,
  );

  const [recordCalendarShouldBeRefetched, setRecordCalendarShouldBeRefetched] =
    useRecoilComponentState(recordCalendarShouldBeRefetchedComponentState);

  useEffect(() => {
    if (recordCalendarShouldBeRefetched && !loading) {
      refetch();

      setRecordCalendarShouldBeRefetched(false);
    }
  }, [
    recordCalendarShouldBeRefetched,
    setRecordCalendarShouldBeRefetched,
    refetch,
    loading,
  ]);

  return null;
};
