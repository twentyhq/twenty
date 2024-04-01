import { useContext } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconPlus } from 'twenty-ui';

import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';

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
  const { columnDefinition } = useContext(RecordBoardColumnContext);
  const { createOneRecord, selectFieldMetadataItem } =
    useContext(RecordBoardContext);

  const onNewClick = () => {
    createOneRecord({
      [selectFieldMetadataItem.name]: columnDefinition.value,
      position: 'last',
    });
  };

  return (
    <StyledButton onClick={onNewClick}>
      <IconPlus size={theme.icon.size.md} />
      New
    </StyledButton>
  );
};
