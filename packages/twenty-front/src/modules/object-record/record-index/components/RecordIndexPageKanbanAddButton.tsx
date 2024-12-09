import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useAddNewCard } from '@/object-record/record-board/record-board-column/hooks/useAddNewCard';
import { useIsOpportunitiesCompanyFieldDisabled } from '@/object-record/record-board/record-board-column/hooks/useIsOpportunitiesCompanyFieldDisabled';
import { recordBoardVisibleFieldDefinitionsComponentSelector } from '@/object-record/record-board/states/selectors/recordBoardVisibleFieldDefinitionsComponentSelector';
import { visibleRecordGroupIdsComponentSelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentSelector';
import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { RecordIndexPageKanbanAddMenuItem } from '@/object-record/record-index/components/RecordIndexPageKanbanAddMenuItem';
import { RecordIndexRootPropsContext } from '@/object-record/record-index/contexts/RecordIndexRootPropsContext';
import { recordIndexKanbanFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexKanbanFieldMetadataIdState';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { PageAddButton } from '@/ui/layout/page/components/PageAddButton';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import styled from '@emotion/styled';
import { useCallback, useContext } from 'react';
import { useRecoilValue } from 'recoil';

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

  const visibleRecordGroupIds = useRecoilComponentValueV2(
    visibleRecordGroupIdsComponentSelector,
  );

  const recordIndexKanbanFieldMetadataId = useRecoilValue(
    recordIndexKanbanFieldMetadataIdState,
  );

  const selectFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === recordIndexKanbanFieldMetadataId,
  );
  const isOpportunity =
    objectMetadataItem.nameSingular === CoreObjectNameSingular.Opportunity;

  const visibleFieldDefinitions = useRecoilComponentValueV2(
    recordBoardVisibleFieldDefinitionsComponentSelector,
    recordIndexId,
  );

  const labelIdentifierField = visibleFieldDefinitions.find(
    (field) => field.isLabelIdentifier,
  );

  const { closeDropdown } = useDropdown(dropdownId);
  const { isOpportunitiesCompanyFieldDisabled } =
    useIsOpportunitiesCompanyFieldDisabled();
  const { handleAddNewCardClick } = useAddNewCard();

  const handleItemClick = useCallback(
    (columnDefinition: RecordGroupDefinition) => {
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
      clickableComponent={<PageAddButton />}
      dropdownId={dropdownId}
      dropdownComponents={
        <StyledDropDownMenu>
          <StyledDropdownMenuItemsContainer>
            {visibleRecordGroupIds.map((recordGroupId) => (
              <RecordIndexPageKanbanAddMenuItem
                key={recordGroupId}
                columnId={recordGroupId}
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
