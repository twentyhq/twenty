import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import {
  type RequestFormField,
  type RequestFormToolResult,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { StyledAiChatAskCard } from '@/ai/components/AiChatAskStyledComponents';
import { useAnswerAgentChatToolCall } from '@/ai/hooks/useAnswerAgentChatToolCall';
import { WorkflowFormFields } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowFormFields';

const StyledFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledActions = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[2]};
`;

type AiChatFormCardProps = {
  toolCallId: string;
  fields: RequestFormField[];
};

export const AiChatFormCard = ({ toolCallId, fields }: AiChatFormCardProps) => {
  const { t } = useLingui();
  const { answerAgentChatToolCall } = useAnswerAgentChatToolCall();
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [error, setError] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    setIsSubmitting(true);

    const isAnswered = await answerAgentChatToolCall({
      toolCallId,
      response: values,
      optimisticToolOutput: {
        success: true,
        result: { status: 'answered', values } satisfies RequestFormToolResult,
      },
    });

    // The card goes once its call is closed, so it stays disabled until then.
    if (!isAnswered) {
      setIsSubmitting(false);
    }
  };

  return (
    <StyledAiChatAskCard>
      <StyledFields>
        <WorkflowFormFields
          fields={fields}
          readonly={isSubmitting}
          onChange={(fieldName, value) =>
            setValues((previousValues) => ({
              ...previousValues,
              [fieldName]: value,
            }))
          }
          onError={setError}
        />
      </StyledFields>
      <StyledActions>
        <Button
          size="sm"
          variant="solid"
          color="accent"
          disabled={isSubmitting || isDefined(error)}
          loading={isSubmitting}
          onClick={() => void submit()}
        >
          {t`Submit`}
        </Button>
      </StyledActions>
    </StyledAiChatAskCard>
  );
};
