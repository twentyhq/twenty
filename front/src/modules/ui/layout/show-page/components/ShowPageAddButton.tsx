import styled from '@emotion/styled';

import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { ActivityTargetableEntity } from '@/activities/types/ActivityTargetableEntity';
import { IconButton } from '@/ui/button/components/IconButton';
import { DropdownButton } from '@/ui/dropdown/components/DropdownButton';
import { DropdownMenuItem } from '@/ui/dropdown/components/DropdownMenuItem';
import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { useDropdownButton } from '@/ui/dropdown/hooks/useDropdownButton';
import { IconCheckbox, IconNotes, IconPlus } from '@/ui/icon/index';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { ActivityType } from '~/generated/graphql';

const StyledContainer = styled.div`
  z-index: 1;
`;

export function ShowPageAddButton({
  entity,
}: {
  entity: ActivityTargetableEntity;
}) {
  const { closeDropdownButton, toggleDropdownButton } = useDropdownButton({
    key: 'add-show-page',
  });
  const openCreateActivity = useOpenCreateActivityDrawer();

  function handleSelect(type: ActivityType) {
    openCreateActivity(type, [entity]);
    closeDropdownButton();
  }

  return (
    <StyledContainer>
      <DropdownButton
        dropdownKey="add-show-page"
        buttonComponents={
          <IconButton
            icon={<IconPlus size={16} />}
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
              <DropdownMenuItem
                onClick={() => handleSelect(ActivityType.Note)}
                accent="regular"
              >
                <IconNotes size={16} />
                Note
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSelect(ActivityType.Task)}
                accent="regular"
              >
                <IconCheckbox size={16} />
                Task
              </DropdownMenuItem>
            </StyledDropdownMenuItemsContainer>
          </StyledDropdownMenu>
        }
        dropdownHotkeyScope={{
          scope: RelationPickerHotkeyScope.RelationPicker,
        }}
      />
    </StyledContainer>
  );
}
