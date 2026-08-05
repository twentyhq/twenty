import { EmailThemedDocument } from '@/activities/emails/editor/extensions/EmailThemedDocument';
import { CampaignVariableTag } from '@/activities/emails/editor/extensions/campaign-variables/CampaignVariableTag';
import { ADVANCED_TEXT_EDITOR_BLOCK_EXTENSIONS } from '@/advanced-text-editor/constants/AdvancedTextEditorBlockExtensions';
import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { buildFullRichTextExtensions } from '@/advanced-text-editor/utils/buildFullRichTextExtensions';
import { parseLegacyHtmlOrPlainTextDocument } from '@/advanced-text-editor/utils/parseLegacyHtmlOrPlainTextDocument';

export const CAMPAIGN_BODY_EDITOR_PROFILE = {
  chrome: 'document',
  minHeight: 0,
  enableFullScreen: false,
  documentExtension: EmailThemedDocument,
  parseLegacyDocument: parseLegacyHtmlOrPlainTextDocument,
  buildExtensions: (context) => [
    ...buildFullRichTextExtensions(context),
    CampaignVariableTag,
    ...ADVANCED_TEXT_EDITOR_BLOCK_EXTENSIONS,
  ],
} satisfies AdvancedTextEditorProfile;
