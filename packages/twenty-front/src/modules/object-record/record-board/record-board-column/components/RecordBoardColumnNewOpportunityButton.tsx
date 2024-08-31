import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconPlus } from 'twenty-ui';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useAddNewOpportunity } from '@/object-record/record-board/record-board-column/hooks/useAddNewOpportunity';
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

export const RecordBoardColumnNewOpportunityButton = () => {
  const theme = useTheme();
  const {
    isCreatingCard,
    handleAddNewOpportunityClick,
    handleCancel,
    handleEntitySelect,
  } = useAddNewOpportunity('last');
  return (
    <>
      {isCreatingCard ? (
        <SingleEntitySelect
          disableBackgroundBlur
          onCancel={handleCancel}
          onEntitySelected={handleEntitySelect}
          relationObjectNameSingular={CoreObjectNameSingular.Company}
          relationPickerScopeId="relation-picker"
          selectedRelationRecordIds={[]}
        />
      ) : (
        <StyledButton onClick={handleAddNewOpportunityClick}>
          <IconPlus size={theme.icon.size.md} />
          New
        </StyledButton>
      )}
    </>
  );
};
