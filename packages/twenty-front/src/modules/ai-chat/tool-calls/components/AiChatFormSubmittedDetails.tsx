import { styled } from '@linaria/react';
import { type RequestFormField } from 'twenty-shared/ai';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatAskDetails } from '@/ai-chat/tool-calls/components/AiChatAskDetails';
import { StyledAiChatAskCard } from '@/ai-chat/tool-calls/components/StyledAiChatAskCard';
import { WorkflowFormFields } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowFormFields';

const AI_CHAT_FORM_SUBMITTED_FIELD_MIN_WIDTH_PX = 240;

const StyledFields = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
  grid-template-columns: repeat(
    auto-fit,
    minmax(min(100%, ${AI_CHAT_FORM_SUBMITTED_FIELD_MIN_WIDTH_PX}px), 1fr)
  );
  padding: ${themeCssVariables.spacing[1]};

  > :last-child:nth-child(odd) {
    grid-column: 1 / -1;
  }
`;

type AiChatFormSubmittedDetailsProps = {
  fields: RequestFormField[];
  values: Record<string, unknown>;
};

export const AiChatFormSubmittedDetails = ({
  fields,
  values,
}: AiChatFormSubmittedDetailsProps) => (
  <AiChatAskDetails>
    <StyledAiChatAskCard isPadded>
      <StyledFields>
        <WorkflowFormFields
          fields={fields.map((field) => ({
            ...field,
            value: values[field.name],
          }))}
          readonly
          onChange={() => {}}
        />
      </StyledFields>
    </StyledAiChatAskCard>
  </AiChatAskDetails>
);
