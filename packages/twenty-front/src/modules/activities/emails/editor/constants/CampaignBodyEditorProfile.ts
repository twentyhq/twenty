import { ADVANCED_TEXT_EDITOR_BLOCK_EXTENSIONS } from '@/advanced-text-editor/constants/AdvancedTextEditorBlockExtensions';
import { EmailThemedDocument } from '@/activities/emails/editor/extensions/EmailThemedDocument';
import { CampaignVariableTag } from '@/activities/emails/editor/extensions/campaign-variables/CampaignVariableTag';
import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { buildFullRichTextExtensions } from '@/advanced-text-editor/utils/buildFullRichTextExtensions';

export const CAMPAIGN_BODY_EDITOR_PROFILE = {
  contentType: 'json',
  chrome: 'document',
  minHeight: 0,
  enableFullScreen: false,
  documentExtension: EmailThemedDocument,
  buildExtensions: (context) => [
    ...buildFullRichTextExtensions(context),
    CampaignVariableTag,
    ...ADVANCED_TEXT_EDITOR_BLOCK_EXTENSIONS,
  ],
} satisfies AdvancedTextEditorProfile;
