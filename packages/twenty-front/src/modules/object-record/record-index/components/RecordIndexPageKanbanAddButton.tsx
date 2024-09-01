import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import styled from '@emotion/styled';
import { useState } from 'react';

import { SingleEntitySelect } from '@/object-record/relation-picker/components/SingleEntitySelect';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordIndexPageKanbanAddMenuItem } from '@/object-record/record-index/components/RecordIndexPageKanbanAddMenuItem';
import { useRecordIndexPageKanbanAddButton } from '@/object-record/record-index/hooks/useRecordIndexPageKanbanAddButton';
import { IconButton } from '@/ui/input/button/components/IconButton';
import { IconPlus } from 'twenty-ui';

const StyledDropdownMenuItemsContainer = styled(DropdownMenuItemsContainer)`
  width: 100%;
`;

type RecordIndexPageKanbanAddButtonProps = {
  recordIndexId: string;
  objectNamePlural: string;
};

export const RecordIndexPageKanbanAddButton = ({
  recordIndexId,
  objectNamePlural,
}: RecordIndexPageKanbanAddButtonProps) => {
  const [isSelectingCompany, setIsSelectingCompany] = useState(false);

  const {
    dropdownId,
    columnIds,
    selectFieldMetadataItem,
    isOpportunity,
    handleOpportunityClick,
    handleNonOpportunityClick,
    handleEntitySelect,
    handleCancel,
  } = useRecordIndexPageKanbanAddButton({
    recordIndexId,
    objectNamePlural,
    setIsSelectingCompany,
  });

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
        <DropdownMenu style={{ width: '200px' }}>
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
                  onItemClick={
                    isOpportunity
                      ? handleOpportunityClick
                      : handleNonOpportunityClick
                  }
                />
              ))}
            </StyledDropdownMenuItemsContainer>
          )}
        </DropdownMenu>
      }
      dropdownHotkeyScope={{ scope: dropdownId }}
    />
  );
};
