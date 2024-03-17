import styled from '@emotion/styled';
import {
  Dropdown,
  DropdownMenu,
  DropdownMenuItemsContainer,
  IconButton,
  IconCheckbox,
  IconNotes,
  IconPlus,
  MenuItem,
  useDropdown,
} from 'twenty-ui';

import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { ActivityType } from '@/activities/types/Activity';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { SHOW_PAGE_ADD_BUTTON_DROPDOWN_ID } from '@/ui/layout/show-page/constants/ShowPageAddButtonDropdownId';

const StyledContainer = styled.div`
  z-index: 1;
`;

export const ShowPageAddButton = ({
  activityTargetObject,
}: {
  activityTargetObject: ActivityTargetableObject;
}) => {
  const { closeDropdown, toggleDropdown } = useDropdown('add-show-page');
  const openCreateActivity = useOpenCreateActivityDrawer();

  const handleSelect = (type: ActivityType) => {
    openCreateActivity({
      type,
      targetableObjects: [activityTargetObject],
    });

    closeDropdown();
  };

  return (
    <StyledContainer>
      <Dropdown
        dropdownId={SHOW_PAGE_ADD_BUTTON_DROPDOWN_ID}
        clickableComponent={
          <IconButton
            Icon={IconPlus}
            size="medium"
            dataTestId="add-showpage-button"
            accent="default"
            variant="secondary"
            onClick={toggleDropdown}
          />
        }
        dropdownComponents={
          <DropdownMenu>
            <DropdownMenuItemsContainer>
              <MenuItem
                onClick={() => handleSelect('Note')}
                accent="default"
                LeftIcon={IconNotes}
                text="Note"
              />
              <MenuItem
                onClick={() => handleSelect('Task')}
                accent="default"
                LeftIcon={IconCheckbox}
                text="Task"
              />
            </DropdownMenuItemsContainer>
          </DropdownMenu>
        }
        dropdownHotkeyScope={{
          scope: PageHotkeyScope.ShowPage,
        }}
      />
    </StyledContainer>
  );
};
