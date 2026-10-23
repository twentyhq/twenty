import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { buildRecordRichTextExtensions } from '@/advanced-text-editor/utils/buildRecordRichTextExtensions';
import { parseLegacyMarkdownDocument } from '@/advanced-text-editor/utils/parseLegacyMarkdownDocument';
import { MentionSuggestion } from '@/mention/extensions/MentionSuggestion';

export const RICH_TEXT_FIELD_EDITOR_PROFILE = {
  chrome: 'document',
  variant: 'app',
  minHeight: 400,
  enableFullScreen: false,
  parseLegacyDocument: parseLegacyMarkdownDocument,
  buildExtensions: (context) => [
    ...buildRecordRichTextExtensions(context),
    MentionSuggestion,
  ],
} satisfies AdvancedTextEditorProfile;
