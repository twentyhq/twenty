import styled from '@emotion/styled';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useAddNewCard } from '@/object-record/record-board/record-board-column/hooks/useAddNewCard';
import { recordBoardNewRecordByColumnIdSelector } from '@/object-record/record-board/states/selectors/recordBoardNewRecordByColumnIdSelector';
import { SingleRecordSelect } from '@/object-record/relation-picker/components/SingleRecordSelect';
import { RecordPickerComponentInstanceContext } from '@/object-record/relation-picker/states/contexts/RecordPickerComponentInstanceContext';
import { useRecoilValue } from 'recoil';

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
  const newRecord = useRecoilValue(
    recordBoardNewRecordByColumnIdSelector({
      familyKey: columnId,
      scopeId: columnId,
    }),
  );
  const { handleCreateSuccess, handleEntitySelect } = useAddNewCard();

  return (
    <>
      {newRecord.isCreating && newRecord.position === position && (
        <StyledCompanyPickerContainer>
          <RecordPickerComponentInstanceContext.Provider
            value={{ instanceId: 'relation-picker' }}
          >
            <SingleRecordSelect
              disableBackgroundBlur
              onCancel={() => handleCreateSuccess(position, columnId, false)}
              onRecordSelected={(company) =>
                company ? handleEntitySelect(position, company) : null
              }
              objectNameSingular={CoreObjectNameSingular.Company}
              recordPickerInstanceId="relation-picker"
              selectedRecordIds={[]}
            />
          </RecordPickerComponentInstanceContext.Provider>
        </StyledCompanyPickerContainer>
      )}
    </>
  );
};
