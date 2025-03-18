import { useRecordBoardAddNewRecord } from '@/object-record/record-board/record-board-column/hooks/useRecordBoardAddNewRecord';
import { useHasObjectReadOnlyPermission } from '@/settings/roles/hooks/useHasObjectReadOnlyPermission';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconPlus } from 'twenty-ui';

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

export const RecordBoardColumnNewRecordButton = () => {
  const theme = useTheme();

  const hasObjectReadOnlyPermission = useHasObjectReadOnlyPermission();

  const { createNewBoardRecord } = useRecordBoardAddNewRecord();

  if (hasObjectReadOnlyPermission) {
    return null;
  }

  return (
    <StyledNewButton
      onClick={() => {
        createNewBoardRecord('last');
      }}
    >
      <IconPlus size={theme.icon.size.md} />
      New
    </StyledNewButton>
  );
};
