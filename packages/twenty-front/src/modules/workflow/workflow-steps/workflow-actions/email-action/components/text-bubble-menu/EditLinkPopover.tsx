import { TextInput } from '@/ui/input/components/TextInput';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useToggleDropdown } from '@/ui/layout/dropdown/hooks/useToggleDropdown';
import { BubbleMenuIconButton } from '@/workflow/workflow-steps/workflow-actions/email-action/components/text-bubble-menu/BubbleMenuIconButton';
import { type Editor } from '@tiptap/core';
import { type FocusEvent, type FormEvent, useId, useState } from 'react';
import { IconLink } from 'twenty-ui/display';

type EditLinkPopoverProps = {
  defaultValue: string | undefined;
  editor: Editor;
};

export const EditLinkPopover = ({
  defaultValue = '',
  editor,
}: EditLinkPopoverProps) => {
  const instanceId = useId();
  const dropdownId = `edit-link-popover-${instanceId}`;

  const [value, setValue] = useState(defaultValue);
  const { toggleDropdown } = useToggleDropdown();

  const handleSubmit = (
    event: FormEvent<HTMLFormElement> | FocusEvent<HTMLInputElement>,
  ) => {
    event.preventDefault();

    if (!value) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: value })
        .run();
    }

    toggleDropdown({ dropdownComponentInstanceIdFromProps: dropdownId });
  };

  return (
    <Dropdown
      onOpen={() => {
        setValue(defaultValue);
      }}
      dropdownComponents={
        <DropdownContent>
          <DropdownMenuItemsContainer>
            <form onSubmit={handleSubmit}>
              <TextInput
                placeholder="Enter link"
                value={value}
                onChange={setValue}
                onBlur={handleSubmit}
              />
            </form>
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
      dropdownId={dropdownId}
      clickableComponent={
        <BubbleMenuIconButton size="medium" Icon={IconLink} />
      }
    />
  );
};
