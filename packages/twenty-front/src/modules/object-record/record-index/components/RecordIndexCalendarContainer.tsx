import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { RecordCalendarContextProvider } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordTableComponentInstanceContext';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';

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
        Calendar View
      </RecordCalendarContextProvider>
    </RecordCalendarComponentInstanceContext.Provider>
  );
};
