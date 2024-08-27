import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconPlus } from 'twenty-ui';

import { useAddNewCard } from '@/object-record/record-board/record-board-column/hooks/useAddNewCard';

const StyledButton = styled.button`
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
  const theme = useTheme();
  const { handleAddNewCardClick } = useAddNewCard('last');
  return (
    <StyledButton onClick={handleAddNewCardClick}>
      <IconPlus size={theme.icon.size.md} />
      New
    </StyledButton>
  );
};
