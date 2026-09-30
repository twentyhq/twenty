import { getAdvancedTextEditorTypographySettings } from '@/advanced-text-editor/constants/getAdvancedTextEditorTypographySettings';
import { type AdvancedTextEditorBlockSetting } from '@/advanced-text-editor/types/AdvancedTextEditorBlockCatalog';
import { msg } from '@lingui/core/macro';

export function getAdvancedTextEditorTextBlockSettings() {
  return [
    ...getAdvancedTextEditorTypographySettings(),
    {
      label: msg`Padding`,
      kind: 'style',
      property: 'padding',
      input: 'box',
      placeholder: '0',
    },
  ] as const satisfies readonly AdvancedTextEditorBlockSetting[];
}
