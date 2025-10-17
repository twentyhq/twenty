import { BubbleMenuIconButton } from '@/advanced-text-editor/components/BubbleMenuIconButton';
import { TextInput } from '@/ui/input/components/TextInput';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useToggleDropdown } from '@/ui/layout/dropdown/hooks/useToggleDropdown';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type Editor } from '@tiptap/core';
import { useId, useState, type FocusEvent, type FormEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconLink, IconPencil } from 'twenty-ui/display';

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
  const isActive = isNonEmptyString(defaultValue);
  const { t } = useLingui();

  const [value, setValue] = useState(defaultValue);
  const { toggleDropdown } = useToggleDropdown();

  const handleSubmit = (
    event: FormEvent<HTMLFormElement> | FocusEvent<HTMLInputElement>,
  ) => {
    event.preventDefault();

    if (!isDefined(value)) {
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
                placeholder={t`Enter link`}
                value={value}
                onChange={setValue}
                onBlur={handleSubmit}
              />
            </form>
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
      dropdownId={dropdownId}
      isDropdownInModal={true}
      clickableComponent={
        <BubbleMenuIconButton
          isActive={isActive}
          Icon={isActive ? IconPencil : IconLink}
        />
      }
    />
  );
};
