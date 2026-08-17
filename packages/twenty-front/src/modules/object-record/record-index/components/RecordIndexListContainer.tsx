import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordList } from '@/object-record/record-list/components/RecordList';
import { RecordListSSESubscribeEffect } from '@/object-record/record-list/components/RecordListSSESubscribeEffect';
import { RecordListContextProvider } from '@/object-record/record-list/contexts/RecordListContext';

type RecordIndexListContainerProps = {
  recordListInstanceId: string;
  viewBarInstanceId: string;
};

export const RecordIndexListContainer = ({
  recordListInstanceId,
  viewBarInstanceId,
}: RecordIndexListContainerProps) => {
  const { objectNameSingular } = useRecordIndexContextOrThrow();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  return (
    <RecordComponentInstanceContextsWrapper
      componentInstanceId={recordListInstanceId}
    >
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
    </RecordComponentInstanceContextsWrapper>
  );
};
