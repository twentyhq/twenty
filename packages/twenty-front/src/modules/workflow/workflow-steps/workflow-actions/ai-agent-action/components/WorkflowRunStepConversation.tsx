import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useAtomValue } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { IconMessage } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useNavigateToAiChatPage } from '@/ai/hooks/useNavigateToAiChatPage';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatAgentChatThread } from '@/metadata-store/types/FlatAgentChatThread';
import { type WorkflowRunStepStatus } from '@/workflow/types/Workflow';

const StyledCard = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  margin: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[4]} 0;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledText = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
`;

type WorkflowRunStepConversationProps = {
  workflowRunId: string;
  stepId: string;
  stepExecutionStatus?: WorkflowRunStepStatus;
};

// The agent step keeps its conversation in a chat thread; a step waiting on
// a person's answer is answered from there.
export const WorkflowRunStepConversation = ({
  workflowRunId,
  stepId,
  stepExecutionStatus,
}: WorkflowRunStepConversationProps) => {
  const { t } = useLingui();
  const threadsStoreEntry = useAtomValue(
    metadataStoreState.atomFamily('agentChatThreads'),
  );
  const { navigateToAiChatPage } = useNavigateToAiChatPage();

  const threads = threadsStoreEntry.current as FlatAgentChatThread[];
  const runThread = threads.find(
    (thread) =>
      thread.workflowRunId === workflowRunId &&
      thread.workflowStepId === stepId,
  );

  if (!isDefined(runThread)) {
    return null;
  }

  const isWaitingForAnswer = stepExecutionStatus === 'PENDING';

  return (
    <StyledCard>
      <StyledText>
        {isWaitingForAnswer
          ? t`The agent asked a question and the run is waiting for the answer.`
          : t`The agent worked in a conversation you can read and reply to.`}
      </StyledText>
      <Button
        Icon={IconMessage}
        title={isWaitingForAnswer ? t`Answer in the conversation` : t`Open conversation`}
        variant="secondary"
        size="small"
        onClick={() => navigateToAiChatPage({ threadId: runThread.id })}
      />
    </StyledCard>
  );
};
