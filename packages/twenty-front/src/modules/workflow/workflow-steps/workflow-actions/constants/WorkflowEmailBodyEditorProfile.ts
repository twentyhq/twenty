import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { buildFullRichTextExtensions } from '@/advanced-text-editor/utils/buildFullRichTextExtensions';
import { parseLegacyHtmlOrPlainTextDocument } from '@/advanced-text-editor/utils/parseLegacyHtmlOrPlainTextDocument';
import { withLegacyVersionlessTipTapDocuments } from '@/advanced-text-editor/utils/withLegacyVersionlessTipTapDocuments';
import { WorkflowVariableTag } from '@/workflow/workflow-variables/extensions/WorkflowVariableTag';

export const WORKFLOW_EMAIL_BODY_EDITOR_PROFILE = {
  chrome: 'field',
  minHeight: 340,
  enableFullScreen: true,
  parseLegacyDocument: withLegacyVersionlessTipTapDocuments(
    parseLegacyHtmlOrPlainTextDocument,
  ),
  buildExtensions: (context) => [
    ...buildFullRichTextExtensions(context),
    WorkflowVariableTag,
  ],
} satisfies AdvancedTextEditorProfile;
