import { useState } from 'react';
import {
  type RequestFormField,
  type RequestFormToolResult,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { AiChatFormCardContent } from '@/ai/components/AiChatFormCardContent';
import { useAnswerAgentChatToolCall } from '@/ai/hooks/useAnswerAgentChatToolCall';

type AiChatFormCardProps = {
  toolCallId: string;
  fields: RequestFormField[];
};

export const AiChatFormCard = ({ toolCallId, fields }: AiChatFormCardProps) => {
  const { answerAgentChatToolCall } = useAnswerAgentChatToolCall();
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [error, setError] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    const isAnswered = await answerAgentChatToolCall({
      toolCallId,
      response: values,
      optimisticToolOutput: {
        success: true,
        result: { status: 'answered', values } satisfies RequestFormToolResult,
      },
    });

    if (!isAnswered) {
      setIsSubmitting(false);
    }
  };

  return (
    <AiChatFormCardContent
      fields={fields}
      isSubmitting={isSubmitting}
      isSubmitDisabled={isDefined(error)}
      onFieldChange={({ fieldName, value }) =>
        setValues((previousValues) => ({
          ...previousValues,
          [fieldName]: value,
        }))
      }
      onError={setError}
      onSubmit={() => void submit()}
    />
  );
};
