import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { AddRecordGroupButton } from '@/object-record/record-group/components/AddRecordGroupButton';
import { canAddRecordGroupForFieldMetadataItem } from '@/object-record/record-group/utils/canAddRecordGroupForFieldMetadataItem';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const RECORD_BOARD_ADD_GROUP_DROPDOWN_ID = 'record-board-add-group-dropdown';

const StyledColumn = styled.div`
  align-items: center;
  display: flex;
  padding-inline: ${themeCssVariables.spacing[2]};
`;

export const RecordBoardAddGroupColumn = () => {
  const { selectFieldMetadataItem } = useContext(RecordBoardContext);

  if (!canAddRecordGroupForFieldMetadataItem(selectFieldMetadataItem)) {
    return null;
  }

  return (
    <StyledColumn>
      <AddRecordGroupButton
        fieldMetadataItem={selectFieldMetadataItem}
        dropdownId={RECORD_BOARD_ADD_GROUP_DROPDOWN_ID}
        dropdownOffset={{ x: 0, y: 10 }}
      />
    </StyledColumn>
  );
};
