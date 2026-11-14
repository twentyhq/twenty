import { HtmlDocumentNode } from '@/advanced-text-editor/extensions/blocks/HtmlDocumentNode';
import { HtmlNode } from '@/advanced-text-editor/extensions/blocks/HtmlNode';
import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { buildFullRichTextExtensions } from '@/advanced-text-editor/utils/buildFullRichTextExtensions';
import { WorkflowVariableTag } from '@/workflow/workflow-variables/extensions/WorkflowVariableTag';

export const WORKFLOW_EMAIL_BODY_EDITOR_PROFILE = {
  chrome: 'field',
  variant: 'email',
  minHeight: 200,
  enableFullScreen: true,
  buildExtensions: (context) => [
    ...buildFullRichTextExtensions(context),
    WorkflowVariableTag,
    HtmlNode.configure({ isInlineEditable: true, defaultHtml: '' }),
    HtmlDocumentNode.configure({ isInlineEditable: true, defaultHtml: '' }),
  ],
} satisfies AdvancedTextEditorProfile;
