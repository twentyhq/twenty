import { useLingui } from '@lingui/react/macro';
import { type MessageDescriptor } from '@lingui/core';

import { CampaignBoxSidesInput } from '@/side-panel/pages/campaign-block-settings/components/CampaignBoxSidesInput';
import { CampaignColorInput } from '@/side-panel/pages/campaign-block-settings/components/CampaignColorInput';
import { CampaignSizeInput } from '@/side-panel/pages/campaign-block-settings/components/CampaignSizeInput';
import { StyledCampaignFieldLabel } from '@/side-panel/pages/campaign-block-settings/components/StyledCampaignFieldLabel';
import { TextInput } from '@/ui/input/components/TextInput';

export type CampaignStyleFieldKind = 'text' | 'color' | 'box' | 'size';

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
    case 'box':
      return (
        <CampaignBoxSidesInput
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
