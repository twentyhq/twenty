import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { RecordList } from '@/object-record/record-list/components/RecordList';
import { RecordListSSESubscribeEffect } from '@/object-record/record-list/components/RecordListSSESubscribeEffect';
import { RecordListContextProvider } from '@/object-record/record-list/contexts/RecordListContext';

type RecordListContainerProps = {
  objectNameSingular: string;
  viewBarInstanceId: string;
};

export const RecordListContainer = ({
  objectNameSingular,
  viewBarInstanceId,
}: RecordListContainerProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  return (
    <RecordListContextProvider
      value={{
        viewBarInstanceId,
        objectNameSingular,
        objectMetadataItem,
        objectPermissions,
      }}
    >
      <RecordList />
      <RecordListSSESubscribeEffect />
    </RecordListContextProvider>
  );
};
