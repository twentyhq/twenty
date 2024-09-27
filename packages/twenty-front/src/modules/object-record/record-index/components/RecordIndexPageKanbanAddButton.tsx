import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';
import { useAddNewCard } from '@/object-record/record-board/record-board-column/hooks/useAddNewCard';
import { useIsOpportunitiesCompanyFieldDisabled } from '@/object-record/record-board/record-board-column/hooks/useIsOpportunitiesCompanyFieldDisabled';
import { RecordBoardColumnDefinition } from '@/object-record/record-board/types/RecordBoardColumnDefinition';
import { RecordIndexPageKanbanAddMenuItem } from '@/object-record/record-index/components/RecordIndexPageKanbanAddMenuItem';
import { RecordIndexRootPropsContext } from '@/object-record/record-index/contexts/RecordIndexRootPropsContext';
import { recordIndexKanbanFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexKanbanFieldMetadataIdState';
import { IconButton } from '@/ui/input/button/components/IconButton';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import styled from '@emotion/styled';
import { useCallback, useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { IconPlus } from 'twenty-ui';

const StyledDropdownMenuItemsContainer = styled(DropdownMenuItemsContainer)`
  width: 100%;
`;

const StyledDropDownMenu = styled(DropdownMenu)`
  width: 200px;
`;

export const RecordIndexPageKanbanAddButton = () => {
  const dropdownId = `record-index-page-add-button-dropdown`;

  const { recordIndexId, objectNameSingular } = useContext(
    RecordIndexRootPropsContext,
  );
  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });

  const recordIndexKanbanFieldMetadataId = useRecoilValue(
    recordIndexKanbanFieldMetadataIdState,
  );

  const selectFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === recordIndexKanbanFieldMetadataId,
  );
  const isOpportunity =
    objectMetadataItem.nameSingular === CoreObjectNameSingular.Opportunity;

  const { columnIdsState, visibleFieldDefinitionsState } =
    useRecordBoardStates(recordIndexId);
  const columnIds = useRecoilValue(columnIdsState);
  const visibleFieldDefinitions = useRecoilValue(
    visibleFieldDefinitionsState(),
  );
  const labelIdentifierField = visibleFieldDefinitions.find(
    (field) => field.isLabelIdentifier,
  );

  const { closeDropdown } = useDropdown(dropdownId);
  const { isOpportunitiesCompanyFieldDisabled } =
    useIsOpportunitiesCompanyFieldDisabled();
  const { handleAddNewCardClick } = useAddNewCard();

  const handleItemClick = useCallback(
    (columnDefinition: RecordBoardColumnDefinition) => {
      const isOpportunityEnabled =
        isOpportunity && !isOpportunitiesCompanyFieldDisabled;
      handleAddNewCardClick(
        labelIdentifierField?.label ?? '',
        '',
        'first',
        isOpportunityEnabled,
        columnDefinition.id,
      );
      closeDropdown();
    },
    [
      isOpportunity,
      handleAddNewCardClick,
      closeDropdown,
      labelIdentifierField,
      isOpportunitiesCompanyFieldDisabled,
    ],
  );

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
        </StyledDropDownMenu>
      }
      dropdownHotkeyScope={{ scope: dropdownId }}
    />
  );
};
