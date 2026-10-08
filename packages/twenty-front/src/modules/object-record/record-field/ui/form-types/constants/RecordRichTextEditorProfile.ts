import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { buildFullRichTextExtensions } from '@/advanced-text-editor/utils/buildFullRichTextExtensions';
import { parseLegacyRecordRichTextDocument } from '@/object-record/record-field/ui/form-types/utils/parseLegacyRecordRichTextDocument';
import { WorkflowVariableTag } from '@/workflow/workflow-variables/extensions/WorkflowVariableTag';

export const RECORD_RICH_TEXT_EDITOR_PROFILE = {
  chrome: 'field',
  minHeight: 340,
  enableFullScreen: true,
  parseLegacyDocument: parseLegacyRecordRichTextDocument,
  buildExtensions: (context) => [
    ...buildFullRichTextExtensions(context),
    WorkflowVariableTag,
  ],
} satisfies AdvancedTextEditorProfile;
