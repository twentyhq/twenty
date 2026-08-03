import { type AdvancedTextEditorCapability } from '@/advanced-text-editor/types/AdvancedTextEditorCapability';

// The capability set for general-purpose rich-text surfaces. Presets that
// need less declare their own narrower list instead of editing this one.
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
