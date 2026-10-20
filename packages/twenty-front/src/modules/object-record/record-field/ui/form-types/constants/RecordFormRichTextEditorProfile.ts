import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { buildRecordRichTextExtensions } from '@/advanced-text-editor/utils/buildRecordRichTextExtensions';
import { parseLegacyMarkdownDocument } from '@/advanced-text-editor/utils/parseLegacyMarkdownDocument';
import { MentionSuggestion } from '@/mention/extensions/MentionSuggestion';

export const RECORD_FORM_RICH_TEXT_EDITOR_PROFILE = {
  chrome: 'field',
  variant: 'app',
  minHeight: 120,
  enableFullScreen: true,
  parseLegacyDocument: parseLegacyMarkdownDocument,
  buildExtensions: (context) => [
    ...buildRecordRichTextExtensions(context),
    MentionSuggestion,
  ],
} satisfies AdvancedTextEditorProfile;
