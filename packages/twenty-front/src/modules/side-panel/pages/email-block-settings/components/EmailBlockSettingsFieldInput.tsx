import { useLingui } from '@lingui/react/macro';

import { type AdvancedTextEditorBlockSetting } from '@/advanced-text-editor/types/AdvancedTextEditorBlockCatalog';
import { EmailAlignmentInput } from '@/side-panel/pages/email-block-settings/components/EmailAlignmentInput';
import { EmailColorInput } from '@/side-panel/pages/email-block-settings/components/EmailColorInput';
import { EmailSizeInput } from '@/side-panel/pages/email-block-settings/components/EmailSizeInput';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';

type EmailBlockSettingsFieldInputProps = {
  field: Pick<
    AdvancedTextEditorBlockSetting,
    'label' | 'input' | 'placeholder'
  >;
  value: string;
  onChange: (value: string) => void;
};

export const EmailBlockSettingsFieldInput = ({
  field,
  value,
  onChange,
}: EmailBlockSettingsFieldInputProps) => {
  const { i18n } = useLingui();
  const label = i18n._(field.label);

  switch (field.input) {
    case 'color':
      return (
        <EmailColorInput
          label={label}
          value={value}
          onChange={onChange}
          placeholder={field.placeholder}
        />
      );
    case 'size':
      return (
        <EmailSizeInput
          label={label}
          value={value}
          onChange={onChange}
          placeholder={field.placeholder}
        />
      );
    case 'alignment':
      return (
        <EmailAlignmentInput label={label} value={value} onChange={onChange} />
      );
    case 'textarea':
      return (
        <TextArea
          textAreaId={`email-block-settings-${label}`}
          label={label}
          value={value}
          onChange={onChange}
          placeholder={field.placeholder ?? ''}
          minRows={6}
          maxRows={16}
        />
      );
    default:
      return (
        <TextInput
          label={label}
          value={value}
          onChange={onChange}
          placeholder={field.placeholder ?? ''}
          fullWidth
        />
      );
  }
};
