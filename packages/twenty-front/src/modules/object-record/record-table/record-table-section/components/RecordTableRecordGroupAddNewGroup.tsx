import { AddRecordGroupButton } from '@/object-record/record-group/components/AddRecordGroupButton';
import { canAddRecordGroupForFieldMetadataItem } from '@/object-record/record-group/utils/canAddRecordGroupForFieldMetadataItem';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const RECORD_TABLE_ADD_GROUP_DROPDOWN_ID = 'record-table-add-group-dropdown';

const StyledContainer = styled.div`
  display: flex;
  padding: ${themeCssVariables.spacing[2]};
`;

export const RecordTableRecordGroupAddNewGroup = () => {
  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  if (
    !canAddRecordGroupForFieldMetadataItem(recordIndexGroupFieldMetadataItem)
  ) {
    return null;
  }

  return (
    <StyledContainer>
      <AddRecordGroupButton
        fieldMetadataItem={recordIndexGroupFieldMetadataItem}
        dropdownId={RECORD_TABLE_ADD_GROUP_DROPDOWN_ID}
      />
    </StyledContainer>
  );
};
