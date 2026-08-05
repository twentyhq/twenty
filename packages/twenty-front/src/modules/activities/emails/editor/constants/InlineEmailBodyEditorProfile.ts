import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { buildFullRichTextWithVariableTagExtensions } from '@/advanced-text-editor/utils/buildFullRichTextExtensions';

export const INLINE_EMAIL_BODY_EDITOR_PROFILE = {
  contentType: 'html',
  chrome: 'field',
  minHeight: 120,
  enableFullScreen: true,
  buildExtensions: buildFullRichTextWithVariableTagExtensions,
} satisfies AdvancedTextEditorProfile;
