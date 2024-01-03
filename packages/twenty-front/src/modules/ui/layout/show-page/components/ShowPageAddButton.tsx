import styled from '@emotion/styled';

import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { ActivityType } from '@/activities/types/Activity';
import { ActivityTargetableEntity } from '@/activities/types/ActivityTargetableEntity';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { IconCheckbox, IconNotes, IconPlus } from '@/ui/display/icon/index';
import { IconButton } from '@/ui/input/button/components/IconButton';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';

import { Dropdown } from '../../dropdown/components/Dropdown';
import { DropdownMenu } from '../../dropdown/components/DropdownMenu';
import { DropdownScope } from '../../dropdown/scopes/DropdownScope';

const StyledContainer = styled.div`
  z-index: 1;
`;

export const ShowPageAddButton = ({
  entity,
}: {
  entity: ActivityTargetableEntity;
}) => {
  const { closeDropdown, toggleDropdown } = useDropdown('add-show-page');
  const openCreateActivity = useOpenCreateActivityDrawer();

  const handleSelect = (type: ActivityType) => {
    openCreateActivity({ type, targetableEntities: [entity] });
    closeDropdown();
  };

  return (
    <StyledContainer>
      <DropdownScope dropdownScopeId="add-show-page">
        <Dropdown
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
      </DropdownScope>
    </StyledContainer>
  );
};
