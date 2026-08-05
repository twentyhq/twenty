import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { buildFullRichTextWithVariableTagExtensions } from '@/advanced-text-editor/utils/buildFullRichTextExtensions';

export const AI_INSTRUCTIONS_EDITOR_PROFILE = {
  contentType: 'markdown',
  chrome: 'field',
  minHeight: 120,
  enableFullScreen: true,
  buildExtensions: buildFullRichTextWithVariableTagExtensions,
} satisfies AdvancedTextEditorProfile;
