import { RecordList } from '@/object-record/record-list/components/RecordList';
import { styled } from '@linaria/react';

const StyledListContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

export const RecordListWidget = () => {
  return (
    <StyledListContainer>
      <RecordList />
    </StyledListContainer>
  );
};
