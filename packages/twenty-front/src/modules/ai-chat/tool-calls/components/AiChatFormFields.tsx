import { styled } from '@linaria/react';
import { type RequestFormField } from 'twenty-shared/ai';
import { themeCssVariables } from 'twenty-ui/theme';

import { WorkflowFormFields } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowFormFields';

const AI_CHAT_FORM_FIELD_MIN_WIDTH_PX = 240;

const StyledFields = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
  grid-template-columns: repeat(
    auto-fit,
    minmax(min(100%, ${AI_CHAT_FORM_FIELD_MIN_WIDTH_PX}px), 1fr)
  );
  padding: 0 ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[1]};

  > :last-child:nth-child(odd) {
    grid-column: 1 / -1;
  }
`;

type AiChatFormFieldsProps = {
  fields: RequestFormField[];
  values: Record<string, unknown>;
  readonly: boolean;
  onFieldChange?: (fieldChange: { fieldName: string; value: unknown }) => void;
  onError?: (error: string | undefined) => void;
};

export const AiChatFormFields = ({
  fields,
  values,
  readonly,
  onFieldChange,
  onError,
}: AiChatFormFieldsProps) => (
  <StyledFields>
    <WorkflowFormFields
      fields={fields.map((field) => ({
        ...field,
        value: values[field.name],
      }))}
      readonly={readonly}
      onChange={(fieldName, value) => onFieldChange?.({ fieldName, value })}
      onError={onError}
    />
  </StyledFields>
);
