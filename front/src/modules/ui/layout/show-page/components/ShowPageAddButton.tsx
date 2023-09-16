import styled from '@emotion/styled';

import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { ActivityTargetableEntity } from '@/activities/types/ActivityTargetableEntity';
import { IconButton } from '@/ui/button/components/IconButton';
import { DropdownButton } from '@/ui/dropdown/components/DropdownButton';
import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { useDropdownButton } from '@/ui/dropdown/hooks/useDropdownButton';
import { IconCheckbox, IconNotes, IconPlus } from '@/ui/icon/index';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';
import { ActivityType } from '~/generated/graphql';

const StyledContainer = styled.div`
  z-index: 1;
`;

export const ShowPageAddButton = ({
  entity,
}: {
  entity: ActivityTargetableEntity;
}) => {
  const { closeDropdownButton, toggleDropdownButton } = useDropdownButton({
    dropdownId: 'add-show-page',
  });
  const openCreateActivity = useOpenCreateActivityDrawer();

  const handleSelect = (type: ActivityType) => {
    openCreateActivity({ type, targetableEntities: [entity] });
    closeDropdownButton();
  };

  return (
    <StyledContainer>
      <DropdownButton
        dropdownId="add-show-page"
        buttonComponents={
          <IconButton
            Icon={IconPlus}
            size="medium"
            dataTestId="add-showpage-button"
            accent="default"
            variant="secondary"
            onClick={toggleDropdownButton}
          />
        }
        dropdownComponents={
          <StyledDropdownMenu>
            <StyledDropdownMenuItemsContainer
              onClick={(e) => e.stopPropagation()}
            >
              <MenuItem
                onClick={() => handleSelect(ActivityType.Note)}
                accent="default"
                LeftIcon={IconNotes}
                text="Note"
              />
              <MenuItem
                onClick={() => handleSelect(ActivityType.Note)}
                accent="default"
                LeftIcon={IconCheckbox}
                text="Task"
              />
            </StyledDropdownMenuItemsContainer>
          </StyledDropdownMenu>
        }
        dropdownHotkeyScope={{
          scope: RelationPickerHotkeyScope.RelationPicker,
        }}
      />
    </StyledContainer>
  );
};
