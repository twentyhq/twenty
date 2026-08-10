import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { buildFullRichTextWithVariableTagExtensions } from '@/advanced-text-editor/utils/buildFullRichTextExtensions';
import { parseLegacyHtmlDocument } from '@/advanced-text-editor/utils/parseLegacyHtmlDocument';

export const INLINE_EMAIL_BODY_EDITOR_PROFILE = {
  chrome: 'document',
  minHeight: 120,
  enableFullScreen: true,
  parseLegacyDocument: parseLegacyHtmlDocument,
  buildExtensions: buildFullRichTextWithVariableTagExtensions,
} satisfies AdvancedTextEditorProfile;
