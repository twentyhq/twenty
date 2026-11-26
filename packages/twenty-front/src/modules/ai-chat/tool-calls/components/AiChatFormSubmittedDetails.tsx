import { type RequestFormField } from 'twenty-shared/ai';

import { AiChatFormFields } from '@/ai-chat/tool-calls/components/AiChatFormFields';
import { StyledAiChatAskCard } from '@/ai-chat/tool-calls/components/StyledAiChatAskCard';

type AiChatFormSubmittedDetailsProps = {
  fields: RequestFormField[];
  values: Record<string, unknown>;
};

export const AiChatFormSubmittedDetails = ({
  fields,
  values,
}: AiChatFormSubmittedDetailsProps) => (
  <StyledAiChatAskCard isPadded>
    <AiChatFormFields fields={fields} values={values} readonly />
  </StyledAiChatAskCard>
);
