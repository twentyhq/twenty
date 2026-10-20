import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { buildFullRichTextExtensions } from '@/advanced-text-editor/utils/buildFullRichTextExtensions';
import { parseLegacyMarkdownDocument } from '@/advanced-text-editor/utils/parseLegacyMarkdownDocument';
import { WorkflowVariableTag } from '@/workflow/workflow-variables/extensions/WorkflowVariableTag';

export const RECORD_RICH_TEXT_EDITOR_PROFILE = {
  chrome: 'field',
  variant: 'app',
  minHeight: 340,
  enableFullScreen: true,
  parseLegacyDocument: parseLegacyMarkdownDocument,
  buildExtensions: (context) => [
    ...buildFullRichTextExtensions(context),
    WorkflowVariableTag,
  ],
} satisfies AdvancedTextEditorProfile;
