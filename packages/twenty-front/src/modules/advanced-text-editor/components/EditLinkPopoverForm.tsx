import { type EditLinkEditor } from '@/advanced-text-editor/types/EditLinkEditor';
import { TextInput } from '@/ui/input/components/TextInput';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState, type FocusEvent, type FormEvent } from 'react';
import { getSafeUrl } from 'twenty-shared/utils';

type EditLinkPopoverFormProps = {
  defaultValue: string;
  editor: Pick<EditLinkEditor, 'chain'>;
};

export const EditLinkPopoverForm = ({
  defaultValue,
  editor,
}: EditLinkPopoverFormProps) => {
  const { t } = useLingui();
  const [value, setValue] = useState(defaultValue);
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
  );
  const { closeDropdown } = useCloseDropdown();

  const handleSubmit = (
    event: FormEvent<HTMLFormElement> | FocusEvent<HTMLInputElement>,
  ) => {
    event.preventDefault();

    if (!isDropdownOpen) {
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
