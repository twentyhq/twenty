import { FORM_FIELD_DEFAULT_TEXTS } from '@/workflow/workflow-steps/workflow-actions/form-action/constants/FormFieldDefaultTexts';
import { type WorkflowFormFieldType } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormFieldType';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

export const getFormFieldDisplayText = ({
  type,
  text,
}: {
  type: WorkflowFormFieldType;
  text: string;
}): string => {
  const defaultText = FORM_FIELD_DEFAULT_TEXTS.find(
    (formFieldDefaultText) =>
      formFieldDefaultText.type === type && formFieldDefaultText.text === text,
  );

  return isDefined(defaultText) ? t(defaultText.message) : text;
};
