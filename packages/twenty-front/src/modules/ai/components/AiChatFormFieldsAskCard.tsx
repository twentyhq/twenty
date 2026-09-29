import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { type InputAskFormField } from 'twenty-shared/ai';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { useAnswerAgentChatAsk } from '@/ai/hooks/useAnswerAgentChatAsk';
import { WorkflowFormFillerFields } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowFormFillerFields';
import { type WorkflowFormActionField } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormActionField';

const StyledCard = styled.div`
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};
  width: 100%;
`;

const StyledActions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

type AiChatFormFieldsAskCardProps = {
  askId: string;
  toolCallId: string;
  fields: InputAskFormField[];
};

export const AiChatFormFieldsAskCard = ({
  askId,
  toolCallId,
  fields,
}: AiChatFormFieldsAskCardProps) => {
  const { t } = useLingui();
  const { answerAgentChatAsk } = useAnswerAgentChatAsk();
  // The Ask snapshots a form step's fields, so they render as that step does.
  const [formData, setFormData] = useState(fields as WorkflowFormActionField[]);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldUpdate = ({
    fieldId,
    value,
  }: {
    fieldId: string;
    value: unknown;
  }) => {
    setFormData((previous) =>
      previous.map((field) =>
        field.id === fieldId ? { ...field, value } : field,
      ),
    );
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    const isAnswered = await answerAgentChatAsk({
      askId,
      toolCallId,
      response: Object.fromEntries(
        formData.map((field) => [field.name, field.value]),
      ),
    });

    if (!isAnswered) {
      setIsSubmitting(false);
    }
  };

  return (
    <StyledCard>
      <WorkflowFormFillerFields
        fields={formData}
        readonly={isSubmitting}
        onFieldUpdate={handleFieldUpdate}
        onError={setError}
      />
      <StyledActions>
        <Button
          size="sm"
          variant="solid"
          color="accent"
          disabled={isSubmitting || error !== undefined}
          loading={isSubmitting}
          onClick={() => void handleSubmit()}
        >
          {t`Submit`}
        </Button>
      </StyledActions>
    </StyledCard>
  );
};
