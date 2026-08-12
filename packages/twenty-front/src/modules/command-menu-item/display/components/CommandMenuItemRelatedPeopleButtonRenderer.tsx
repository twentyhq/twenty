import { RelatedPersonRelationList } from '@/activities/emails/related-people/components/RelatedPersonRelationList';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { interpolateCommandMenuItemFields } from '@/command-menu-item/display/utils/interpolateCommandMenuItemFields';
import { CommandMenuButton } from '@/command-menu/components/CommandMenuButton';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { COMMAND_MENU_DEFAULT_ICON } from '@/workflow/workflow-trigger/constants/CommandMenuDefaultIcon';
import { useContext } from 'react';
import { useIcons } from 'twenty-ui/icon';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

type CommandMenuItemRelatedPeopleButtonRendererProps = {
  item: CommandMenuItemFieldsFragment;
  isPrimaryAction: boolean;
};

export const CommandMenuItemRelatedPeopleButtonRenderer = ({
  item,
  isPrimaryAction,
}: CommandMenuItemRelatedPeopleButtonRendererProps) => {
  const { commandMenuContextApi } = useContext(CommandMenuContext);
  const { getIcon } = useIcons();
  const { closeDropdown } = useCloseDropdown();

  const { iconKey, label, shortLabel } = interpolateCommandMenuItemFields(
    item,
    commandMenuContextApi,
  );

  const Icon = getIcon(iconKey, COMMAND_MENU_DEFAULT_ICON);

  const dropdownId = `command-menu-item-related-people-${item.id}`;

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="bottom-end"
      clickableComponent={
        <CommandMenuButton
          command={{ key: item.id, label, shortLabel, Icon }}
          isPrimaryAction={isPrimaryAction}
        />
      }
      dropdownComponents={
        <DropdownContent>
          <DropdownMenuItemsContainer>
            <RelatedPersonRelationList
              selectableListInstanceId={dropdownId}
              onComposed={() => closeDropdown(dropdownId)}
            />
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
