import { TextInput } from '@/ui/input/components/TextInput';
import { DropdownFocusEffect } from '@/ui/utilities/focus/components/DropdownFocusEffect';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type Editor } from '@tiptap/core';
import { useState, type FocusEvent, type FormEvent } from 'react';
import { getSafeUrl } from 'twenty-shared/utils';
import { Dropdown, LightIconButton } from 'twenty-ui/components';
import { IconLink, IconPencil } from 'twenty-ui/icon';

type EditLinkPopoverProps = {
  defaultValue: string | undefined;
  editor: Editor;
};

export const EditLinkPopover = ({
  defaultValue = '',
  editor,
}: EditLinkPopoverProps) => {
  const isActive = isNonEmptyString(defaultValue);
  const { t } = useLingui();
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);

  const handleSubmit = (
    event: FormEvent<HTMLFormElement> | FocusEvent<HTMLInputElement>,
  ) => {
    event.preventDefault();

    if (!isOpen) {
      return;
    }

    if (!isNonEmptyString(value)) {
      setIsOpen(false);
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    const href = getSafeUrl(value);

    if (!isNonEmptyString(href)) {
      return;
    }

    setIsOpen(false);
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
  };

  return (
    <Dropdown.Root
      kind="panel"
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);

        if (open) {
          setValue(defaultValue);
        }
      }}
    >
      <Dropdown.Trigger
        render={
          <LightIconButton
            aria-label={isActive ? t`Edit link` : t`Add link`}
            aria-pressed={isActive}
            emphasis={isActive ? 'standard' : 'subtle'}
            size="sm"
          >
            {isActive ? <IconPencil /> : <IconLink />}
          </LightIconButton>
        }
      />
      <Dropdown.Content
        sideOffset={0}
        align="end"
        finalFocus={(interaction) =>
          interaction === 'keyboard' ? editor.view.dom : false
        }
        aria-label={isActive ? t`Edit link` : t`Add link`}
      >
        <DropdownFocusEffect />
        <Dropdown.Section>
          <form onSubmit={handleSubmit}>
            <TextInput
              aria-label={t`Enter link`}
              placeholder={t`Enter link`}
              value={value}
              onChange={setValue}
              onBlur={handleSubmit}
              autoFocus
            />
          </form>
        </Dropdown.Section>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};
