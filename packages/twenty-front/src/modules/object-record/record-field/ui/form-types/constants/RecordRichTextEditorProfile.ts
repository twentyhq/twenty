import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { buildFullRichTextWithVariableTagExtensions } from '@/advanced-text-editor/utils/buildFullRichTextExtensions';

export const RECORD_RICH_TEXT_EDITOR_PROFILE = {
  contentType: 'json',
  chrome: 'field',
  minHeight: 340,
  enableFullScreen: true,
  buildExtensions: buildFullRichTextWithVariableTagExtensions,
} satisfies AdvancedTextEditorProfile;
