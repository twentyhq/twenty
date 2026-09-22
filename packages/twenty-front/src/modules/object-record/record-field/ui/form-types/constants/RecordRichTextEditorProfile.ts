import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { buildFullRichTextExtensions } from '@/advanced-text-editor/utils/buildFullRichTextExtensions';
import { FormSubmitShortcut } from '@/object-record/record-field/ui/form-types/extensions/FormSubmitShortcut';
import { WorkflowVariableTag } from '@/workflow/workflow-variables/extensions/WorkflowVariableTag';

export const RECORD_RICH_TEXT_EDITOR_PROFILE = {
  chrome: 'field',
  minHeight: 120,
  enableFullScreen: true,
  buildExtensions: (context) => [
    ...buildFullRichTextExtensions(context),
    WorkflowVariableTag,
    FormSubmitShortcut,
  ],
} satisfies AdvancedTextEditorProfile;
