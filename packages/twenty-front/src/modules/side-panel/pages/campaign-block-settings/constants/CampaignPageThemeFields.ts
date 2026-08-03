import { msg } from '@lingui/core/macro';

import { type CampaignThemeField } from '@/side-panel/pages/campaign-block-settings/types/CampaignThemeField';

export const CAMPAIGN_PAGE_THEME_FIELDS: CampaignThemeField[] = [
  { label: msg`Background`, property: 'pageBackground', input: 'color' },
  {
    label: msg`Padding`,
    property: 'pagePadding',
    input: 'box',
    placeholder: '24',
  },
];
