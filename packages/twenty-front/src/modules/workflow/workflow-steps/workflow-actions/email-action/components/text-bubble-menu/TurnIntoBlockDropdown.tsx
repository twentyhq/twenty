import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useTurnIntoBlockOptions } from '@/workflow/workflow-steps/workflow-actions/email-action/hooks/useTurnIntoBlockOptions';
import { type Editor } from '@tiptap/react';
import { IconPilcrow } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

type TurnIntoBlockDropdownProps = {
  editor: Editor;
};

export const TurnIntoBlockDropdown = ({
  editor,
}: TurnIntoBlockDropdownProps) => {
  const options = useTurnIntoBlockOptions(editor);
  const activeItem = options.find((option) => option.isActive());
  const { icon: ActiveIcon = IconPilcrow, title: activeTitle = 'Paragraph' } =
    activeItem ?? {};

  return (
    <Dropdown
      dropdownComponents={
        <DropdownContent>
          <DropdownMenuItemsContainer>
            {options.map((option) => (
              <MenuItem
                key={option.id}
                text={option.title}
                LeftIcon={option.icon}
                onClick={option.onClick}
              />
            ))}
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
      dropdownId="turn-into-block-dropdown"
      clickableComponent={<MenuItem text={activeTitle} LeftIcon={ActiveIcon} />}
    />
  );
};
