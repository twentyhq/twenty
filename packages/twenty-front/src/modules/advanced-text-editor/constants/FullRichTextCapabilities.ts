import { type AdvancedTextEditorCapability } from '@/advanced-text-editor/types/AdvancedTextEditorCapability';

// The historical capability set every rich-text surface had before presets
// owned capabilities. Narrow a preset deliberately instead of editing this.
export const FULL_RICH_TEXT_CAPABILITIES: readonly AdvancedTextEditorCapability[] =
  [
    'basicMarks',
    'headings',
    'lists',
    'links',
    'images',
    'variables',
    'slashCommand',
  ];
