import styled from '@emotion/styled';
import { IconPlus } from 'twenty-ui';

import { RecordBoardCard } from '@/object-record/record-board/record-board-card/components/RecordBoardCard';
import { useTheme } from '@emotion/react';
import { useState } from 'react';

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

export const RecordBoardColumnNewButton = () => {
  const [isCreatingNewCard, setIsCreatingNewCard] = useState(false);
  const theme = useTheme();
  const handleNewButtonClick = () => {
    setIsCreatingNewCard(true);
  };

  if (isCreatingNewCard) {
    return (
      <RecordBoardCard
        isCreating={true}
        onCreateSuccess={() => setIsCreatingNewCard(false)}
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
