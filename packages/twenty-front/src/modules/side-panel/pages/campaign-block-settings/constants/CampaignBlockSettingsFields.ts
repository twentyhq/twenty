/* oxlint-disable twenty/no-hardcoded-colors --
   placeholders show literal inline CSS examples for email content, where
   theme variables do not exist */
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

export type CampaignBlockSettingsField = {
  label: MessageDescriptor;
  // 'style' fields edit one property of the inline CSS style attribute;
  // 'attribute' fields edit a plain node attribute (e.g. the button href).
  kind: 'style' | 'attribute';
  property: string;
  input: 'text' | 'color';
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
      input: 'text',
      placeholder: '12px',
    },
    {
      label: msg`Corner radius`,
      kind: 'style',
      property: 'border-radius',
      input: 'text',
      placeholder: '8px',
    },
    {
      label: msg`Border`,
      kind: 'style',
      property: 'border',
      input: 'text',
      placeholder: '1px solid #e1e1e1',
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
      input: 'text',
      placeholder: '12px',
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
      input: 'text',
      placeholder: '12px',
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
      input: 'text',
      placeholder: '10px 20px',
    },
    {
      label: msg`Corner radius`,
      kind: 'style',
      property: 'border-radius',
      input: 'text',
      placeholder: '6px',
    },
  ],
  [TIPTAP_NODE_TYPES.EMAIL_DIVIDER]: [
    {
      label: msg`Line`,
      kind: 'style',
      property: 'border-top',
      input: 'text',
      placeholder: '1px solid #e1e1e1',
    },
    {
      label: msg`Margin`,
      kind: 'style',
      property: 'margin',
      input: 'text',
      placeholder: '16px 0',
    },
  ],
};
