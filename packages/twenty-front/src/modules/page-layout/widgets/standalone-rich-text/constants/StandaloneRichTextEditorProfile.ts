import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { buildRecordRichTextExtensions } from '@/advanced-text-editor/utils/buildRecordRichTextExtensions';
import { parseLegacyMarkdownDocument } from '@/advanced-text-editor/utils/parseLegacyMarkdownDocument';

export const STANDALONE_RICH_TEXT_EDITOR_PROFILE = {
  chrome: 'document',
  variant: 'app',
  minHeight: 0,
  enableFullScreen: false,
  parseLegacyDocument: parseLegacyMarkdownDocument,
  buildExtensions: buildRecordRichTextExtensions,
} satisfies AdvancedTextEditorProfile;
