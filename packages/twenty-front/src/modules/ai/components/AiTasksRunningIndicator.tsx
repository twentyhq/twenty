import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import {
  parseSetuAiTaskProjection,
  type SetuAiTaskProjection,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import {
  IconChevronDown,
  IconChevronUp,
  IconLoader,
  IconQuestionMark,
} from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { StyledAiChatContentContainer } from '@/ai/components/StyledAiChatContentContainer';
import { AI_ACTIVE_TASKS_POLL_INTERVAL_MS } from '@/ai/constants/AiActiveTasksPollIntervalMs';
import { AI_ACTIVE_TASKS } from '@/ai/graphql/queries/aiActiveTasks';
import { useSelectAiChatThread } from '@/ai/hooks/useSelectAiChatThread';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  type AiActiveTasksQuery,
  FeatureFlagKey,
} from '~/generated-metadata/graphql';

const StyledContainer = styled(StyledAiChatContentContainer)`
  padding: 0 ${themeCssVariables.spacing[3]};
`;

const StyledToggle = styled.button`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: inline-flex;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const StyledList = styled.ul`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  list-style: none;
  margin: ${themeCssVariables.spacing[1]} 0 0;
  padding: ${themeCssVariables.spacing[1]};
`;

const StyledTaskButton = styled.button`
  background: none;
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: block;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  text-align: left;
  width: 100%;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledTaskDetail = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
`;

type ActiveTask = { threadId: string | null; task: SetuAiTaskProjection };

// A compact reminder above the composer that work continues in the
// background, with a way back to the thread that started each task.
export const AiTasksRunningIndicator = () => {
  const { t } = useLingui();
  const isEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_SETU_AI_TASKS_ENABLED,
  );
  const [isOpen, setIsOpen] = useState(false);
  const { selectAiChatThread } = useSelectAiChatThread();
  const { data } = useQuery<AiActiveTasksQuery>(AI_ACTIVE_TASKS, {
    skip: !isEnabled,
    fetchPolicy: 'network-only',
    pollInterval: AI_ACTIVE_TASKS_POLL_INTERVAL_MS,
    skipPollAttempt: () => document.visibilityState !== 'visible',
    notifyOnNetworkStatusChange: false,
  });

  const activeTasks: ActiveTask[] = (data?.aiActiveTasks ?? []).flatMap(
    (entry) => {
      const parsed = parseSetuAiTaskProjection(entry.task);

      return parsed.status === 'valid'
        ? [{ threadId: entry.threadId ?? null, task: parsed.task }]
        : [];
    },
  );

  if (!isEnabled || activeTasks.length === 0) {
    return null;
  }

  const waitingCount = activeTasks.filter(
    ({ task }) => task.status === 'waiting_input',
  ).length;
  const runningCount = activeTasks.length - waitingCount;
  const summary =
    waitingCount > 0
      ? runningCount > 0
        ? t`${runningCount} running · ${waitingCount} need your answer`
        : waitingCount === 1
          ? t`1 task needs your answer`
          : t`${waitingCount} tasks need your answer`
      : runningCount === 1
        ? t`1 task running`
        : t`${runningCount} tasks running`;

  return (
    <StyledContainer>
      <StyledToggle
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
      >
        {waitingCount > 0 ? (
          <IconQuestionMark size={14} />
        ) : (
          <IconLoader size={14} />
        )}
        {summary}
        {isOpen ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
      </StyledToggle>
      {isOpen && (
        <StyledList>
          {activeTasks.map(({ threadId, task }) => {
            const completedCount = task.steps.filter(
              (step) => step.status === 'completed',
            ).length;
            const companies = task.steps
              .map((step) => step.companyName)
              .join(', ');

            return (
              <li key={task.id}>
                <StyledTaskButton
                  type="button"
                  disabled={!isDefined(threadId)}
                  onClick={() => {
                    if (isDefined(threadId)) {
                      selectAiChatThread(threadId);
                      setIsOpen(false);
                    }
                  }}
                >
                  {t`Research: ${companies}`}{' '}
                  <StyledTaskDetail>
                    {t`${completedCount} of ${task.steps.length} ready`}
                  </StyledTaskDetail>
                </StyledTaskButton>
              </li>
            );
          })}
        </StyledList>
      )}
    </StyledContainer>
  );
};
