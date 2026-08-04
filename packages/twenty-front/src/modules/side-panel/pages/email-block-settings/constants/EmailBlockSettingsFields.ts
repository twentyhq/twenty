/* oxlint-disable twenty/no-hardcoded-colors --
   placeholders show literal inline CSS examples for email content, where
   theme variables do not exist */
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

import { type EmailStyleFieldKind } from '@/side-panel/pages/email-block-settings/components/EmailBlockSettingsFieldInput';

export type EmailBlockSettingsField = {
  label: MessageDescriptor;
  // 'style' fields edit one property of the inline CSS style attribute;
  // 'attribute' fields edit a plain node attribute (e.g. the button href).
  kind: 'style' | 'attribute';
  property: string;
  input: EmailStyleFieldKind;
  placeholder?: string;
};

// Which fields the block settings side panel offers per email block node,
// in display order. The equivalent of @react-email/editor's getDefaultLayout.
export const EMAIL_BLOCK_SETTINGS_FIELDS: Record<
  string,
  EmailBlockSettingsField[]
> = {
  [TIPTAP_NODE_TYPES.SECTION]: [
    // Typography here cascades to every block inside the section, so a
    // section is how one part of an email gets its own look.
    {
      label: msg`Text color`,
      kind: 'style',
      property: 'color',
      input: 'color',
    },
    {
      label: msg`Font size`,
      kind: 'style',
      property: 'fontSize',
      input: 'size',
      placeholder: '14',
    },
    {
      label: msg`Line height`,
      kind: 'style',
      property: 'lineHeight',
      input: 'text',
      placeholder: '1.5',
    },
    {
      label: msg`Letter spacing`,
      kind: 'style',
      property: 'letterSpacing',
      input: 'size',
      placeholder: '0',
    },
    {
      label: msg`Alignment`,
      kind: 'style',
      property: 'textAlign',
      input: 'alignment',
    },
    {
      label: msg`Background`,
      kind: 'style',
      property: 'backgroundColor',
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
      property: 'borderRadius',
      input: 'box',
      placeholder: '8',
    },
    {
      label: msg`Border`,
      kind: 'style',
      property: 'borderWidth',
      input: 'size',
      placeholder: '0',
    },
    {
      label: msg`Border color`,
      kind: 'style',
      property: 'borderColor',
      input: 'color',
    },
  ],
  [TIPTAP_NODE_TYPES.COLUMNS]: [
    {
      label: msg`Background`,
      kind: 'style',
      property: 'backgroundColor',
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
  [TIPTAP_NODE_TYPES.COLUMN]: [
    {
      label: msg`Background`,
      kind: 'style',
      property: 'backgroundColor',
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
  [TIPTAP_NODE_TYPES.BUTTON]: [
    {
      label: msg`Alignment`,
      kind: 'attribute',
      property: 'align',
      input: 'alignment',
    },
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
      property: 'backgroundColor',
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
      property: 'borderRadius',
      input: 'box',
      placeholder: '6',
    },
  ],
  [TIPTAP_NODE_TYPES.IMAGE]: [
    {
      label: msg`Alignment`,
      kind: 'attribute',
      property: 'align',
      input: 'alignment',
    },
    {
      label: msg`Link URL`,
      kind: 'attribute',
      property: 'href',
      input: 'text',
      placeholder: 'https://',
    },
    {
      label: msg`Source`,
      kind: 'attribute',
      property: 'src',
      input: 'text',
      placeholder: 'https://',
    },
    {
      label: msg`Alt text`,
      kind: 'attribute',
      property: 'alt',
      input: 'text',
    },
    {
      label: msg`Width`,
      kind: 'attribute',
      property: 'width',
      input: 'text',
      placeholder: 'auto',
    },
  ],
  [TIPTAP_NODE_TYPES.HTML]: [
    {
      label: msg`HTML`,
      kind: 'attribute',
      property: 'html',
      input: 'textarea',
      placeholder: '<p>Hello</p>',
    },
  ],
  [TIPTAP_NODE_TYPES.DIVIDER]: [
    {
      label: msg`Thickness`,
      kind: 'style',
      property: 'borderTopWidth',
      input: 'size',
      placeholder: '1',
    },
    {
      label: msg`Color`,
      kind: 'style',
      property: 'borderTopColor',
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
