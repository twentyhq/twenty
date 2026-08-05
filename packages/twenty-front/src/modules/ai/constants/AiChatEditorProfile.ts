import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { parseLegacyPlainTextDocument } from '@/advanced-text-editor/utils/parseLegacyPlainTextDocument';
import { withLegacyVersionlessTipTapDocuments } from '@/advanced-text-editor/utils/withLegacyVersionlessTipTapDocuments';
import { MentionSuggestion } from '@/mention/extensions/MentionSuggestion';
import { MentionTag } from '@/mention/extensions/MentionTag';

export const AI_CHAT_EDITOR_PROFILE = {
  chrome: 'document',
  minHeight: 0,
  enableFullScreen: false,
  parseLegacyDocument: withLegacyVersionlessTipTapDocuments(
    parseLegacyPlainTextDocument,
  ),
  buildExtensions: () => [MentionTag, MentionSuggestion],
} satisfies AdvancedTextEditorProfile;
