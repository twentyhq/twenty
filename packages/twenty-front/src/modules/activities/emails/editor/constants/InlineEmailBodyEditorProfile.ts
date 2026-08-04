import { VariableTag } from '@/advanced-text-editor/extensions/variable-tag/VariableTag';
import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { buildFullRichTextExtensions } from '@/advanced-text-editor/utils/buildFullRichTextExtensions';

export const INLINE_EMAIL_BODY_EDITOR_PROFILE = {
  contentType: 'html',
  chrome: 'field',
  minHeight: 120,
  enableFullScreen: true,
  buildExtensions: (context) => [
    ...buildFullRichTextExtensions(context),
    VariableTag,
  ],
} satisfies AdvancedTextEditorProfile;
