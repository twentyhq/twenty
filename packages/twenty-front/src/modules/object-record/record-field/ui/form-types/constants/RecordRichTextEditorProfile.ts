import { VariableTag } from '@/advanced-text-editor/extensions/variable-tag/VariableTag';
import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { buildFullRichTextExtensions } from '@/advanced-text-editor/utils/buildFullRichTextExtensions';

export const RECORD_RICH_TEXT_EDITOR_PROFILE = {
  contentType: 'json',
  chrome: 'field',
  minHeight: 340,
  enableFullScreen: true,
  buildExtensions: (context) => [
    ...buildFullRichTextExtensions(context),
    VariableTag,
  ],
} satisfies AdvancedTextEditorProfile;
