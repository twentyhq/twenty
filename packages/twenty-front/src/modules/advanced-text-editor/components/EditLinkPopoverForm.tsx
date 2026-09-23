import { TextInput } from '@/ui/input/components/TextInput';
import { useCloseDropdownRoot } from '@/ui/layout/dropdown/hooks/useCloseDropdownRoot';
import { useIsDropdownRootOpen } from '@/ui/layout/dropdown/hooks/useIsDropdownRootOpen';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type Editor } from '@tiptap/core';
import { useState, type FocusEvent, type FormEvent } from 'react';
import { getSafeUrl } from 'twenty-shared/utils';

type EditLinkPopoverFormProps = {
  defaultValue: string;
  editor: Editor;
};

export const EditLinkPopoverForm = ({
  defaultValue,
  editor,
}: EditLinkPopoverFormProps) => {
  const { t } = useLingui();
  const [value, setValue] = useState(defaultValue);
  const isOpen = useIsDropdownRootOpen();
  const { closeDropdown } = useCloseDropdownRoot();

  const handleSubmit = (
    event: FormEvent<HTMLFormElement> | FocusEvent<HTMLInputElement>,
  ) => {
    event.preventDefault();

    if (!isOpen) {
      return;
    }

    if (!isNonEmptyString(value)) {
      closeDropdown();
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    const href = getSafeUrl(value);

    if (!isNonEmptyString(href)) {
      return;
    }

    closeDropdown();
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
  };

  return (
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
  );
};
