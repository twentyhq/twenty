import { HtmlNode } from '@/advanced-text-editor/extensions/blocks/HtmlNode';
import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { buildFullRichTextExtensions } from '@/advanced-text-editor/utils/buildFullRichTextExtensions';
import { parseLegacyWorkflowEmailBodyDocument } from '@/workflow/workflow-steps/workflow-actions/utils/parseLegacyWorkflowEmailBodyDocument';
import { WorkflowVariableTag } from '@/workflow/workflow-variables/extensions/WorkflowVariableTag';

export const WORKFLOW_EMAIL_BODY_EDITOR_PROFILE = {
  chrome: 'field',
  minHeight: 200,
  enableFullScreen: true,
  parseLegacyDocument: parseLegacyWorkflowEmailBodyDocument,
  buildExtensions: (context) => [
    ...buildFullRichTextExtensions(context),
    WorkflowVariableTag,
    HtmlNode.configure({ isInlineEditable: true, defaultHtml: '' }),
  ],
} satisfies AdvancedTextEditorProfile;
