import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type EmailTheme } from 'twenty-shared/utils';

export type CampaignPageStyleField = {
  label: MessageDescriptor;
  themeKey: keyof EmailTheme;
  input: 'text' | 'color';
  placeholder?: string;
};

// Document-level fields shown when no block is selected, mirroring Resend's
// "Page style" panel.
export const CAMPAIGN_PAGE_STYLE_FIELDS: CampaignPageStyleField[] = [
  {
    label: msg`Page background`,
    themeKey: 'pageBackground',
    input: 'color',
  },
  {
    label: msg`Body background`,
    themeKey: 'bodyBackground',
    input: 'color',
  },
  {
    label: msg`Text color`,
    themeKey: 'textColor',
    input: 'color',
  },
  {
    label: msg`Width`,
    themeKey: 'width',
    input: 'text',
    placeholder: '600px',
  },
  {
    label: msg`Padding`,
    themeKey: 'padding',
    input: 'text',
    placeholder: '24px',
  },
  {
    label: msg`Corner radius`,
    themeKey: 'cornerRadius',
    input: 'text',
    placeholder: '8px',
  },
  {
    label: msg`Border`,
    themeKey: 'border',
    input: 'text',
    placeholder: 'none',
  },
];
