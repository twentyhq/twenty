import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { InboxPlanToolCallEditor } from '@/inbox/components/InboxPlanToolCallEditor';
import { InboxToolCallFailureNotice } from '@/inbox/components/InboxToolCallFailureNotice';
import { InboxEmailComposer } from '@/inbox/tool-call-renderers/email/components/InboxEmailComposer';
import { getEmailComposerPrefillFromToolCall } from '@/inbox/tool-call-renderers/email/utils/getEmailComposerPrefillFromToolCall';
import { type InboxToolCallEditorProps } from '@/inbox/tool-call-renderers/types/InboxToolCallRenderer';
import { InboxItemToolCallStatus } from '~/generated/graphql';

const StyledCard = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

type InboxEmailToolCallEditorProps = InboxToolCallEditorProps;

// An email proposal on an item that is not about a thread: the composer where
// the schema form used to be. Once the call went through there is nothing
// left to compose, and the read-only form says what was sent.
export const InboxEmailToolCallEditor = ({
  toolCall,
  source,
  onSave,
  onRegisterFlush,
}: InboxEmailToolCallEditorProps) => {
  const isFailed = toolCall.status === InboxItemToolCallStatus.FAILED;
  const isEditable =
    toolCall.status === InboxItemToolCallStatus.PROPOSED || isFailed;

  if (!isEditable) {
    return (
      <InboxPlanToolCallEditor
        toolCall={toolCall}
        source={source}
        onSave={onSave}
      />
    );
  }

  return (
    <>
      {isFailed && <InboxToolCallFailureNotice error={toolCall.error} />}
      <StyledCard>
        <InboxEmailComposer
          prefill={getEmailComposerPrefillFromToolCall(toolCall)}
          onSave={onSave}
          ref={(handle) => onRegisterFlush?.(handle ? handle.flushSave : null)}
        />
      </StyledCard>
    </>
  );
};
