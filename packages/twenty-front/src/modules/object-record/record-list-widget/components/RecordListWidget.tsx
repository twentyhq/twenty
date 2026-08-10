import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordList } from '@/object-record/record-list/components/RecordList';
import { RecordListSSESubscribeEffect } from '@/object-record/record-list/components/RecordListSSESubscribeEffect';
import { RecordListContextProvider } from '@/object-record/record-list/contexts/RecordListContext';
import { styled } from '@linaria/react';

const StyledListContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

export const RecordListWidget = () => {
  const { objectNameSingular, viewBarInstanceId } =
    useRecordIndexContextOrThrow();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  return (
    <StyledListContainer>
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
    </StyledListContainer>
  );
};
