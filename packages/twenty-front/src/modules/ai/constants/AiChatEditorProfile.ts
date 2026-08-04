import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { MentionSuggestion } from '@/mention/extensions/MentionSuggestion';
import { MentionTag } from '@/mention/extensions/MentionTag';

export const AI_CHAT_EDITOR_PROFILE = {
  contentType: 'json',
  chrome: 'document',
  minHeight: 0,
  enableFullScreen: false,
  buildExtensions: () => [MentionTag, MentionSuggestion],
} satisfies AdvancedTextEditorProfile;
