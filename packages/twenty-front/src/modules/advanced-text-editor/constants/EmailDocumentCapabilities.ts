import { type AdvancedTextEditorCapability } from '@/advanced-text-editor/types/AdvancedTextEditorCapability';

// Layout and formatting shared by every structured email editor. Each surface
// adds its own variable capability because campaign and workflow variables use
// different discovery and preview contexts while persisting the same node.
export const EMAIL_DOCUMENT_CAPABILITIES = [
  'basicMarks',
  'headings',
  'lists',
  'links',
  'images',
  'slashCommand',
  'blocks',
] as const satisfies readonly AdvancedTextEditorCapability[];
