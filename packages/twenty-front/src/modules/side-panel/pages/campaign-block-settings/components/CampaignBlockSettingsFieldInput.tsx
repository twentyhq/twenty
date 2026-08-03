import { useLingui } from '@lingui/react/macro';
import { type MessageDescriptor } from '@lingui/core';

import { CampaignColorInput } from '@/side-panel/pages/campaign-block-settings/components/CampaignColorInput';
import { CampaignSizeInput } from '@/side-panel/pages/campaign-block-settings/components/CampaignSizeInput';
import { StyledCampaignFieldLabel } from '@/side-panel/pages/campaign-block-settings/components/StyledCampaignFieldLabel';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';

export type CampaignStyleFieldKind =
  | 'text'
  | 'color'
  | 'box'
  | 'size'
  | 'textarea';

type CampaignBlockSettingsFieldInputProps = {
  field: {
    label: MessageDescriptor;
    input: CampaignStyleFieldKind;
    placeholder?: string;
  };
  value: string;
  onChange: (value: string) => void;
};

export const CampaignBlockSettingsFieldInput = ({
  field,
  value,
  onChange,
}: CampaignBlockSettingsFieldInputProps) => {
  const { i18n } = useLingui();
  const label = i18n._(field.label);

  switch (field.input) {
    case 'color':
      return (
        <CampaignColorInput
          label={label}
          value={value}
          onChange={onChange}
          placeholder={field.placeholder}
        />
      );
    case 'size':
      return (
        <CampaignSizeInput
          label={label}
          value={value}
          onChange={onChange}
          placeholder={field.placeholder}
        />
      );
    case 'textarea':
      return (
        <div>
          <StyledCampaignFieldLabel>{label}</StyledCampaignFieldLabel>
          <TextArea
            textAreaId={`campaign-block-settings-${label}`}
            value={value}
            onChange={onChange}
            placeholder={field.placeholder ?? ''}
            minRows={6}
            maxRows={16}
          />
        </div>
      );
    default:
      return (
        <div>
          <StyledCampaignFieldLabel>{label}</StyledCampaignFieldLabel>
          <TextInput
            value={value}
            onChange={onChange}
            placeholder={field.placeholder ?? ''}
            fullWidth
          />
        </div>
      );
  }
};
