import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';
import { RecordBoardColumnDefinition } from '@/object-record/record-board/types/RecordBoardColumnDefinition';
import { RecordIndexPageKanbanAddMenuItem } from '@/object-record/record-index/components/RecordIndexPageKanbanAddMenuItem';
import { RecordIndexRootPropsContext } from '@/object-record/record-index/contexts/RecordIndexRootPropsContext';
import { useRecordIndexPageKanbanAddButton } from '@/object-record/record-index/hooks/useRecordIndexPageKanbanAddButton';
import { SingleEntitySelect } from '@/object-record/relation-picker/components/SingleEntitySelect';
import { useEntitySelectSearch } from '@/object-record/relation-picker/hooks/useEntitySelectSearch';
import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { IconButton } from '@/ui/input/button/components/IconButton';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import styled from '@emotion/styled';
import { useCallback, useContext, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { IconPlus, isDefined } from 'twenty-ui';

const StyledDropdownMenuItemsContainer = styled(DropdownMenuItemsContainer)`
  width: 100%;
`;

const StyledDropDownMenu = styled(DropdownMenu)`
  width: 200px;
`;

export const RecordIndexPageKanbanAddButton = () => {
  const dropdownId = `record-index-page-add-button-dropdown`;
  const [isSelectingCompany, setIsSelectingCompany] = useState(false);
  const [selectedColumnDefinition, setSelectedColumnDefinition] =
    useState<RecordBoardColumnDefinition>();

  const { recordIndexId, objectNamePlural } = useContext(
    RecordIndexRootPropsContext,
  );

  const { columnIdsState } = useRecordBoardStates(recordIndexId);
  const columnIds = useRecoilValue(columnIdsState);

  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();
  const { resetSearchFilter } = useEntitySelectSearch({
    relationPickerScopeId: 'relation-picker',
  });

  const { closeDropdown } = useDropdown(dropdownId);

  const {
    selectFieldMetadataItem,
    isOpportunity,
    createOpportunity,
    createRecordWithoutCompany,
  } = useRecordIndexPageKanbanAddButton({
    objectNamePlural,
  });

  const handleItemClick = useCallback(
    (columnDefinition: RecordBoardColumnDefinition) => {
      if (isOpportunity) {
        setIsSelectingCompany(true);
        setSelectedColumnDefinition(columnDefinition);
        setHotkeyScopeAndMemorizePreviousScope(
          RelationPickerHotkeyScope.RelationPicker,
        );
      } else {
        createRecordWithoutCompany(columnDefinition);
        closeDropdown();
      }
    },
    [
      isOpportunity,
      createRecordWithoutCompany,
      setHotkeyScopeAndMemorizePreviousScope,
      closeDropdown,
    ],
  );

  const handleEntitySelect = useCallback(
    (company?: EntityForSelect) => {
      setIsSelectingCompany(false);
      goBackToPreviousHotkeyScope();
      resetSearchFilter();
      if (isDefined(company) && isDefined(selectedColumnDefinition)) {
        createOpportunity(company, selectedColumnDefinition);
      }
      closeDropdown();
    },
    [
      createOpportunity,
      goBackToPreviousHotkeyScope,
      resetSearchFilter,
      selectedColumnDefinition,
      closeDropdown,
    ],
  );

  const handleCancel = useCallback(() => {
    resetSearchFilter();
    goBackToPreviousHotkeyScope();
    setIsSelectingCompany(false);
  }, [goBackToPreviousHotkeyScope, resetSearchFilter]);

  if (!selectFieldMetadataItem) {
    return null;
  }

  return (
    <Dropdown
      dropdownMenuWidth="200px"
      dropdownPlacement="bottom-start"
      clickableComponent={
        <IconButton
          Icon={IconPlus}
          dataTestId="add-button"
          size="medium"
          variant="secondary"
          accent="default"
          ariaLabel="Add"
        />
      }
      dropdownId={dropdownId}
      dropdownComponents={
        <StyledDropDownMenu>
          {isOpportunity && isSelectingCompany ? (
            <SingleEntitySelect
              disableBackgroundBlur
              onCancel={handleCancel}
              onEntitySelected={handleEntitySelect}
              relationObjectNameSingular={CoreObjectNameSingular.Company}
              relationPickerScopeId="relation-picker"
              selectedRelationRecordIds={[]}
            />
          ) : (
            <StyledDropdownMenuItemsContainer>
              {columnIds.map((columnId) => (
                <RecordIndexPageKanbanAddMenuItem
                  key={columnId}
                  columnId={columnId}
                  recordIndexId={recordIndexId}
                  onItemClick={handleItemClick}
                />
              ))}
            </StyledDropdownMenuItemsContainer>
          )}
        </StyledDropDownMenu>
      }
      dropdownHotkeyScope={{ scope: dropdownId }}
    />
  );
};
