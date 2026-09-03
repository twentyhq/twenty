import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordListContainer } from '@/object-record/record-list/components/RecordListContainer';
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

  return (
    <StyledListContainer>
      <RecordListContainer
        objectNameSingular={objectNameSingular}
        viewBarInstanceId={viewBarInstanceId}
      />
    </StyledListContainer>
  );
};
