import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { parseLegacyPlainTextDocument } from '@/advanced-text-editor/utils/parseLegacyPlainTextDocument';
import { MentionSuggestion } from '@/mention/extensions/MentionSuggestion';
import { MentionTag } from '@/mention/extensions/MentionTag';

export const AI_CHAT_EDITOR_PROFILE = {
  chrome: 'document',
  minHeight: 0,
  enableFullScreen: false,
  parseLegacyDocument: parseLegacyPlainTextDocument,
  buildExtensions: () => [MentionTag, MentionSuggestion],
} satisfies AdvancedTextEditorProfile;
