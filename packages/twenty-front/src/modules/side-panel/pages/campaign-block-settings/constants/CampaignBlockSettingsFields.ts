/* oxlint-disable twenty/no-hardcoded-colors --
   placeholders show literal inline CSS examples for email content, where
   theme variables do not exist */
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

import { type CampaignStyleFieldKind } from '@/side-panel/pages/campaign-block-settings/components/CampaignBlockSettingsFieldInput';

export type CampaignBlockSettingsField = {
  label: MessageDescriptor;
  // 'style' fields edit one property of the inline CSS style attribute;
  // 'attribute' fields edit a plain node attribute (e.g. the button href).
  kind: 'style' | 'attribute';
  property: string;
  input: CampaignStyleFieldKind;
  placeholder?: string;
};

// Which fields the block settings side panel offers per email block node,
// in display order. The equivalent of @react-email/editor's getDefaultLayout.
export const CAMPAIGN_BLOCK_SETTINGS_FIELDS: Record<
  string,
  CampaignBlockSettingsField[]
> = {
  [TIPTAP_NODE_TYPES.EMAIL_SECTION]: [
    {
      label: msg`Background`,
      kind: 'style',
      property: 'background-color',
      input: 'color',
    },
    {
      label: msg`Padding`,
      kind: 'style',
      property: 'padding',
      input: 'box',
      placeholder: '12',
    },
    {
      label: msg`Corner radius`,
      kind: 'style',
      property: 'border-radius',
      input: 'box',
      placeholder: '8',
    },
    {
      label: msg`Border`,
      kind: 'style',
      property: 'border-width',
      input: 'size',
      placeholder: '0',
    },
    {
      label: msg`Border color`,
      kind: 'style',
      property: 'border-color',
      input: 'color',
    },
  ],
  [TIPTAP_NODE_TYPES.EMAIL_COLUMNS]: [
    {
      label: msg`Background`,
      kind: 'style',
      property: 'background-color',
      input: 'color',
    },
    {
      label: msg`Padding`,
      kind: 'style',
      property: 'padding',
      input: 'box',
      placeholder: '12',
    },
  ],
  [TIPTAP_NODE_TYPES.EMAIL_COLUMN]: [
    {
      label: msg`Background`,
      kind: 'style',
      property: 'background-color',
      input: 'color',
    },
    {
      label: msg`Padding`,
      kind: 'style',
      property: 'padding',
      input: 'box',
      placeholder: '12',
    },
  ],
  [TIPTAP_NODE_TYPES.EMAIL_BUTTON]: [
    {
      label: msg`Link URL`,
      kind: 'attribute',
      property: 'href',
      input: 'text',
      placeholder: 'https://',
    },
    {
      label: msg`Background`,
      kind: 'style',
      property: 'background-color',
      input: 'color',
    },
    {
      label: msg`Text color`,
      kind: 'style',
      property: 'color',
      input: 'color',
    },
    {
      label: msg`Padding`,
      kind: 'style',
      property: 'padding',
      input: 'box',
      placeholder: '10',
    },
    {
      label: msg`Corner radius`,
      kind: 'style',
      property: 'border-radius',
      input: 'box',
      placeholder: '6',
    },
  ],
  [TIPTAP_NODE_TYPES.EMAIL_HTML]: [
    {
      label: msg`HTML`,
      kind: 'attribute',
      property: 'html',
      input: 'textarea',
      placeholder: '<p>Hello</p>',
    },
  ],
  [TIPTAP_NODE_TYPES.EMAIL_DIVIDER]: [
    {
      label: msg`Thickness`,
      kind: 'style',
      property: 'border-top-width',
      input: 'size',
      placeholder: '1',
    },
    {
      label: msg`Color`,
      kind: 'style',
      property: 'border-top-color',
      input: 'color',
    },
    {
      label: msg`Margin`,
      kind: 'style',
      property: 'margin',
      input: 'box',
      placeholder: '16',
    },
  ],
};
