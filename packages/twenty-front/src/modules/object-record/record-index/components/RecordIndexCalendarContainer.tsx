import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { RecordCalendar } from '@/object-record/record-calendar/components/RecordCalendar';
import { RecordIndexCalendarDataLoaderEffect } from '@/object-record/record-calendar/components/RecordIndexCalendarDataLoaderEffect';
import { RecordCalendarContextProvider } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { isDefined } from 'twenty-shared/utils';

type RecordIndexCalendarContainerProps = {
  recordCalendarInstanceId: string;
  viewBarInstanceId: string;
};

export const RecordIndexCalendarContainer = ({
  viewBarInstanceId,
  recordCalendarInstanceId,
}: RecordIndexCalendarContainerProps) => {
  const { objectNameSingular } = useRecordIndexContextOrThrow();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const { currentView } = useGetCurrentViewOnly();

  if (
    !isDefined(currentView) ||
    !isDefined(currentView.calendarFieldMetadataId)
  ) {
    return null;
  }

  return (
    <RecordCalendarComponentInstanceContext.Provider
      value={{
        instanceId: recordCalendarInstanceId,
      }}
    >
      <RecordCalendarContextProvider
        value={{
          viewBarInstanceId,
          objectNameSingular,
          visibleRecordFields: [],
          objectMetadataItem,
          objectPermissions,
        }}
      >
        <RecordCalendar />
        <RecordIndexCalendarDataLoaderEffect />
      </RecordCalendarContextProvider>
    </RecordCalendarComponentInstanceContext.Provider>
  );
};
