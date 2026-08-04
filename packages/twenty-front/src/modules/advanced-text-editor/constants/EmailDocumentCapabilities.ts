import { type AdvancedTextEditorCapability } from '@/advanced-text-editor/types/AdvancedTextEditorCapability';

export const EMAIL_DOCUMENT_CAPABILITIES = [
  'basicMarks',
  'headings',
  'lists',
  'links',
  'images',
  'slashCommand',
  'blocks',
] as const satisfies readonly AdvancedTextEditorCapability[];
