import styled from '@emotion/styled';

import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { ActivityTargetableEntity } from '@/activities/types/ActivityTargetableEntity';
import { IconButton } from '@/ui/button/components/IconButton';
import { DropdownButton } from '@/ui/dropdown/components/DropdownButton';
import { DropdownMenu } from '@/ui/dropdown/components/DropdownMenu';
import { DropdownMenuItem } from '@/ui/dropdown/components/DropdownMenuItem';
import { DropdownMenuItemsContainer } from '@/ui/dropdown/components/DropdownMenuItemsContainer';
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
  const { closeDropdownButton } = useDropdownButton();
  const openCreateActivity = useOpenCreateActivityDrawer();

  function handleSelect(type: ActivityType) {
    console.log(type, entity);
    openCreateActivity(type, [entity]);
    closeDropdownButton();
  }

  return (
    <StyledContainer>
      <DropdownButton
        buttonComponents={
          <IconButton
            icon={<IconPlus size={16} />}
            size="large"
            data-testid="add-showpage"
            textColor={'secondary'}
            variant="border"
          />
        }
        dropdownComponents={
          <DropdownMenu>
            <DropdownMenuItemsContainer onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem
                onClick={() => handleSelect(ActivityType.Note)}
                accent="regular"
              >
                <IconNotes size={16} />
                Note
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSelect(ActivityType.Note)}
                accent="regular"
              >
                <IconCheckbox size={16} />
                Task
              </DropdownMenuItem>
            </DropdownMenuItemsContainer>
          </DropdownMenu>
        }
        dropdownScopeToSet={{
          scope: RelationPickerHotkeyScope.RelationPicker,
        }}
      />
    </StyledContainer>
  );
}
