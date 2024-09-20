import { RecordBoardCard } from '@/object-record/record-board/record-board-card/components/RecordBoardCard';
import { recordBoardNewRecordByColumnIdSelector } from '@/object-record/record-board/states/selectors/recordBoardNewRecordByColumnIdSelector';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { IconPlus } from 'twenty-ui';
import { useAddNewCard } from '../hooks/useAddNewCard';

const StyledNewButton = styled.button`
  align-items: center;
  align-self: baseline;
  background-color: ${({ theme }) => theme.background.primary};
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1)};

  &:hover {
    background-color: ${({ theme }) => theme.background.tertiary};
  }
`;

export const RecordBoardColumnNewButton = ({
  columnId,
}: {
  columnId: string;
}) => {
  const theme = useTheme();
 
  const newRecord = useRecoilValue(
    recordBoardNewRecordByColumnIdSelector({
      familyKey: columnId,
      scopeId: columnId,
    }),
  );

  const { handleAddNewCardClick ,handleCreateSuccess } = useAddNewCard();

  const handleNewButtonClick = () => {
    handleAddNewCardClick('', 'last');
  };

 

  if (newRecord.isCreating && newRecord.position === 'last') {
    return (
      <RecordBoardCard
        isCreating={true}
        onCreateSuccess={()=>handleCreateSuccess('last')}
        position='last'
      />
    );
  }

  return (
    <StyledNewButton onClick={handleNewButtonClick}>
      <IconPlus size={theme.icon.size.md} />
      New
    </StyledNewButton>
  );
};
