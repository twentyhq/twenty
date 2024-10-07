import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconPlus } from 'twenty-ui';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useColumnNewCardActions } from '@/object-record/record-board/record-board-column/hooks/useColumnNewCardActions';
import { SingleEntitySelect } from '@/object-record/relation-picker/components/SingleEntitySelect';

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

export const RecordBoardColumnNewOpportunityButton = ({
  columnId,
}: {
  columnId: string;
}) => {
  const theme = useTheme();

  const {
    newRecord,
    handleNewButtonClick,
    handleEntitySelect,
    handleCreateSuccess,
  } = useColumnNewCardActions(columnId);
  return (
    <>
      {newRecord.isCreating &&
      newRecord.position === 'last' &&
      newRecord.isOpportunity ? (
        <SingleEntitySelect
          disableBackgroundBlur
          onCancel={() => handleCreateSuccess('last', columnId, false)}
          onEntitySelected={(company) =>
            company ? handleEntitySelect('last', company) : null
          }
          relationObjectNameSingular={CoreObjectNameSingular.Company}
          relationPickerScopeId="relation-picker"
          selectedRelationRecordIds={[]}
        />
      ) : (
        <StyledButton onClick={() => handleNewButtonClick('last', true)}>
          <IconPlus size={theme.icon.size.md} />
          New
        </StyledButton>
      )}
    </>
  );
};
