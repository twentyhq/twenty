import { type AdvancedTextEditorBlockSetting } from '@/advanced-text-editor/types/AdvancedTextEditorBlockCatalog';
import { msg } from '@lingui/core/macro';
import { EMAIL_TYPOGRAPHY } from 'twenty-shared/utils';

export function getAdvancedTextEditorTypographySettings() {
  return [
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
      placeholder: EMAIL_TYPOGRAPHY.lineHeight,
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
  ] as const satisfies readonly AdvancedTextEditorBlockSetting[];
}
