import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { buildFullRichTextWithVariableTagExtensions } from '@/advanced-text-editor/utils/buildFullRichTextExtensions';
import { parseLegacyMarkdownDocument } from '@/advanced-text-editor/utils/parseLegacyMarkdownDocument';

export const AI_INSTRUCTIONS_EDITOR_PROFILE = {
  chrome: 'field',
  minHeight: 120,
  enableFullScreen: true,
  parseLegacyDocument: parseLegacyMarkdownDocument,
  buildExtensions: buildFullRichTextWithVariableTagExtensions,
} satisfies AdvancedTextEditorProfile;
