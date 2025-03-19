import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { useHasObjectReadOnlyPermission } from '@/settings/roles/hooks/useHasObjectReadOnlyPermission';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useContext } from 'react';
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

  const { objectMetadataItem, selectFieldMetadataItem } =
    useContext(RecordBoardContext);

  const { columnDefinition } = useContext(RecordBoardColumnContext);

  const hasObjectReadOnlyPermission = useHasObjectReadOnlyPermission();

  const { createNewIndexRecord } = useCreateNewIndexRecord({
    objectMetadataItem: objectMetadataItem,
  });

  if (hasObjectReadOnlyPermission) {
    return null;
  }

  return (
    <StyledNewButton
      onClick={() => {
        createNewIndexRecord({
          position: 'last',
          [selectFieldMetadataItem.name]: columnDefinition.value,
        });
      }}
    >
      <IconPlus size={theme.icon.size.md} />
      New
    </StyledNewButton>
  );
};
