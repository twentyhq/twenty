import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { RecordCalendar } from '@/object-record/record-calendar/components/RecordCalendar';
import { RecordCalendarSSESubscribeEffect } from '@/object-record/record-calendar/components/RecordCalendarSSESubscribeEffect';
import { RecordIndexCalendarDataLoaderEffect } from '@/object-record/record-calendar/components/RecordIndexCalendarDataLoaderEffect';
import { RecordIndexCalendarSelectedDateInitEffect } from '@/object-record/record-calendar/components/RecordIndexCalendarSelectedDateInitEffect';
import { RecordCalendarContextProvider } from '@/object-record/record-calendar/contexts/RecordCalendarContext';

type RecordCalendarContainerProps = {
  objectNameSingular: string;
  viewBarInstanceId: string;
};

export const RecordCalendarContainer = ({
  objectNameSingular,
  viewBarInstanceId,
}: RecordCalendarContainerProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  return (
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
      <RecordCalendarSSESubscribeEffect />
      <RecordIndexCalendarDataLoaderEffect />
      <RecordIndexCalendarSelectedDateInitEffect />
    </RecordCalendarContextProvider>
  );
};
