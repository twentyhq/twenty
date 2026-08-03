import { msg } from '@lingui/core/macro';

import { type CampaignThemeField } from '@/side-panel/pages/campaign-block-settings/types/CampaignThemeField';

export const CAMPAIGN_BODY_THEME_FIELDS: CampaignThemeField[] = [
  { label: msg`Alignment`, property: 'textAlign', input: 'alignment' },
  { label: msg`Text`, property: 'textColor', input: 'color' },
  { label: msg`Background`, property: 'bodyBackground', input: 'color' },
  { label: msg`Width`, property: 'width', input: 'size', placeholder: '600' },
  { label: msg`Padding`, property: 'padding', input: 'box', placeholder: '24' },
  {
    label: msg`Corner radius`,
    property: 'cornerRadius',
    input: 'box',
    placeholder: '8',
  },
  {
    label: msg`Border`,
    property: 'borderWidth',
    input: 'size',
    placeholder: '0',
  },
  { label: msg`Border color`, property: 'borderColor', input: 'color' },
];
