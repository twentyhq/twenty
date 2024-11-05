import styled from '@emotion/styled';

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

const StyledCompanyPickerContainer = styled.div`
  align-items: center;
  align-self: baseline;
  background-color: ${({ theme }) => theme.background.primary};
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const RecordBoardColumnNewOpportunity = ({
  columnId,
  position,
}: {
  columnId: string;
  position: 'last' | 'first';
}) => {
  const { handleEntitySelect, handleCreateSuccess, newRecord } =
    useColumnNewCardActions(columnId);
  return (
    <>
      {newRecord.isCreating && newRecord.position === position && (
        <StyledCompanyPickerContainer>
          <SingleEntitySelect
            disableBackgroundBlur
            onCancel={() => handleCreateSuccess(position, columnId, false)}
            onEntitySelected={(company) =>
              company ? handleEntitySelect(position, company) : null
            }
            relationObjectNameSingular={CoreObjectNameSingular.Company}
            relationPickerScopeId="relation-picker"
            selectedRelationRecordIds={[]}
          />
        </StyledCompanyPickerContainer>
      )}
    </>
  );
};
