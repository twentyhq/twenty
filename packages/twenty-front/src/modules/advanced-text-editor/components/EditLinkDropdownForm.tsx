import { TextInputDropdownForm } from '@/advanced-text-editor/components/TextInputDropdownForm';
import { type EditLinkEditor } from '@/advanced-text-editor/types/EditLinkEditor';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { getSafeUrl } from 'twenty-shared/utils';

type EditLinkDropdownFormProps = {
  defaultValue: string;
  editor: Pick<EditLinkEditor, 'chain'>;
};

export const EditLinkDropdownForm = ({
  defaultValue,
  editor,
}: EditLinkDropdownFormProps) => {
  const { t } = useLingui();
  const { closeDropdown } = useCloseDropdown();

  const handleSubmit = (value: string) => {
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
    <TextInputDropdownForm
      defaultValue={defaultValue}
      label={t`Enter link`}
      onSubmit={handleSubmit}
    />
  );
};
