import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { isRecordBoardViewSettingsReadOnlyComponentState } from '@/object-record/record-board/states/isRecordBoardViewSettingsReadOnlyComponentState';
import { AddRecordGroupButton } from '@/object-record/record-group/components/AddRecordGroupButton';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { canAddRecordGroupForFieldMetadataItem } from '@/object-record/record-group/utils/canAddRecordGroupForFieldMetadataItem';
import { useTaskManagerAddRecordGroupAppScopeFilter } from '@/task-manager/hooks/useTaskManagerAddRecordGroupAppScopeFilter';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
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
  const { recordIndexId } = useRecordIndexContextOrThrow();
  const { selectFieldMetadataItem } = useContext(RecordBoardContext);

  const isRecordBoardViewSettingsReadOnly = useAtomComponentStateValue(
    isRecordBoardViewSettingsReadOnlyComponentState,
  );

  const projectFieldMetadataId = objectMetadataItem.fields.find(
    (field) => field.name === 'project',
  )?.id;

  const appScopeFilter = useTaskManagerAddRecordGroupAppScopeFilter({
    objectNameSingular: objectMetadataItem.nameSingular,
    groupByFieldName: selectFieldMetadataItem.name,
    projectFieldMetadataId,
    viewFilters: currentView?.viewFilters ?? [],
  });

  if (isRecordBoardViewSettingsReadOnly) {
    return null;
  }

  if (!canAddRecordGroupForFieldMetadataItem(selectFieldMetadataItem)) {
    return null;
  }

  return (
    <StyledColumn>
      <AddRecordGroupButton
        fieldMetadataItem={selectFieldMetadataItem}
        dropdownId={`${RECORD_BOARD_ADD_GROUP_DROPDOWN_ID}-${recordIndexId}`}
        dropdownOffset={{ x: 0, y: 10 }}
        filter={appScopeFilter}
      />
    </StyledColumn>
  );
};
