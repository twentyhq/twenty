import { type MessageDescriptor } from '@lingui/core';
import { type CanvasTheme } from 'twenty-shared/utils';

import { type CampaignStyleFieldKind } from '@/side-panel/pages/campaign-block-settings/components/CampaignBlockSettingsFieldInput';

export type CampaignThemeField = {
  label: MessageDescriptor;
  property: keyof CanvasTheme;
  input: CampaignStyleFieldKind;
  placeholder?: string;
};
