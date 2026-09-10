import { type AdvancedTextEditorBlockSetting } from '@/advanced-text-editor/types/AdvancedTextEditorBlockCatalog';
import { msg } from '@lingui/core/macro';

export function getAdvancedTextEditorContainerAppearanceSettings() {
  return [
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
  ] as const satisfies readonly AdvancedTextEditorBlockSetting[];
}
