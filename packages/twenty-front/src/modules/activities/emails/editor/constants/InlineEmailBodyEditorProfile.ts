import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { buildFullRichTextWithVariableTagExtensions } from '@/advanced-text-editor/utils/buildFullRichTextExtensions';
import { parseLegacyEmailBodyDocument } from '@/advanced-text-editor/utils/parseLegacyEmailBodyDocument';

export const INLINE_EMAIL_BODY_EDITOR_PROFILE = {
  chrome: 'document',
  variant: 'email',
  minHeight: 120,
  enableFullScreen: true,
  parseLegacyDocument: parseLegacyEmailBodyDocument,
  buildExtensions: buildFullRichTextWithVariableTagExtensions,
} satisfies AdvancedTextEditorProfile;
