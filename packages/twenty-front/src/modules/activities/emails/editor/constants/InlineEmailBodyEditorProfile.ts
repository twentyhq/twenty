import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { buildFullRichTextWithVariableTagExtensions } from '@/advanced-text-editor/utils/buildFullRichTextExtensions';
import { parseLegacyHtmlDocument } from '@/advanced-text-editor/utils/parseLegacyHtmlDocument';

export const INLINE_EMAIL_BODY_EDITOR_PROFILE = {
  // The composer body runs flush to the panel edges, so the editor paints no
  // field border or background of its own.
  chrome: 'document',
  minHeight: 120,
  enableFullScreen: true,
  parseLegacyDocument: parseLegacyHtmlDocument,
  buildExtensions: buildFullRichTextWithVariableTagExtensions,
} satisfies AdvancedTextEditorProfile;
