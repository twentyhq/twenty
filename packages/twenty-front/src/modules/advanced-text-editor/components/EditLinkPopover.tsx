import { TextInput } from '@/ui/input/components/TextInput';
import { DropdownFocusCleanupEffect } from '@/ui/utilities/focus/components/DropdownFocusCleanupEffect';
import { useDropdownFocus } from '@/ui/utilities/focus/hooks/useDropdownFocus';
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
  const { focusId, updateDropdownFocus } = useDropdownFocus();

  const handleOpenChange = (open: boolean) => {
    updateDropdownFocus(open);
    setIsOpen(open);

    if (open) {
      setValue(defaultValue);
    }
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement> | FocusEvent<HTMLInputElement>,
  ) => {
    event.preventDefault();

    if (!isOpen) {
      return;
    }

    if (!isNonEmptyString(value)) {
      handleOpenChange(false);
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    const href = getSafeUrl(value);

    if (!isNonEmptyString(href)) {
      return;
    }

    handleOpenChange(false);
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
  };

  return (
    <Dropdown.Root kind="panel" open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownFocusCleanupEffect focusId={focusId} />
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
