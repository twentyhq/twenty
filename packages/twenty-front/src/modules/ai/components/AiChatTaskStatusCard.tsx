import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useRef, useState } from 'react';
import {
  type SetuAiErrorCode,
  type SetuAiTaskProjection,
} from 'twenty-shared/ai';
import { IconPlayerStop } from 'twenty-ui/icon';
import { Tag } from 'twenty-ui/primitives/data-display';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { StyledAiChatAskCard } from '@/ai/components/AiChatAskStyledComponents';
import { AiChatInteractionFallback } from '@/ai/components/AiChatInteractionFallback';
import { AiTaskStepRow } from '@/ai/components/AiTaskStepRow';
import { useAiTaskOperations } from '@/ai/hooks/useAiTaskOperations';
import { useAiTaskState } from '@/ai/hooks/useAiTaskState';
import { getAiTaskErrorMessage } from '@/ai/utils/getAiTaskErrorMessage';
import { getAiTaskStatusPresentation } from '@/ai/utils/getAiTaskStatusPresentation';

// A focus longer than a person would type is the model restating its own
// instructions, which adds noise rather than context.
const MAX_DISPLAYED_FOCUS_LENGTH = 120;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledTitle = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledFocus = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
  padding: 0 ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[2]};
`;

const StyledSteps = styled.ul`
  margin: 0;
  padding: 0;
`;

const StyledStatusLine = styled.p`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledError = styled.p`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
  outline: none;
  padding: 0 ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[2]};
`;

const StyledActions = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledLoading = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[3]};
`;

type AiChatTaskStatusCardContentProps = {
  task: SetuAiTaskProjection;
};

const AiChatTaskStatusCardContent = ({
  task,
}: AiChatTaskStatusCardContentProps) => {
  const { t } = useLingui();
  const errorRef = useRef<HTMLParagraphElement>(null);
  const { answer, retry, cancel } = useAiTaskOperations(task.id);
  const [isCancelling, setIsCancelling] = useState(false);
  const [operationErrorCode, setOperationErrorCode] = useState<
    SetuAiErrorCode | null | undefined
  >(undefined);
  const { label, color, description } = getAiTaskStatusPresentation(task);

  const runOperation = async (
    perform: () => ReturnType<typeof cancel>,
  ): Promise<boolean> => {
    setOperationErrorCode(undefined);

    const result = await perform();

    if (!result.isSuccessful) {
      setOperationErrorCode(result.errorCode);
      // Moving focus announces the failure and keeps keyboard users in place.
      requestAnimationFrame(() => errorRef.current?.focus());
    }

    return result.isSuccessful;
  };

  const stopTask = async () => {
    setIsCancelling(true);
    await runOperation(() => cancel(task));
    setIsCancelling(false);
  };

  return (
    <StyledAiChatAskCard role="group" aria-label={t`Account research`}>
      <StyledHeader>
        <StyledTitle>{t`Account research`}</StyledTitle>
        <Tag color={color} variant="soft">
          {label}
        </Tag>
      </StyledHeader>
      {task.focus !== null &&
        task.focus.length <= MAX_DISPLAYED_FOCUS_LENGTH && (
          <StyledFocus>{t`Focus: ${task.focus}`}</StyledFocus>
        )}
      <StyledSteps>
        {task.steps.map((step) => (
          <AiTaskStepRow
            key={step.id}
            step={step}
            onAnswer={(values) => runOperation(() => answer(step, values))}
            onRetry={() => runOperation(() => retry(step))}
          />
        ))}
      </StyledSteps>
      <StyledStatusLine role="status" aria-live="polite">
        {description}
      </StyledStatusLine>
      {operationErrorCode !== undefined && (
        <StyledError ref={errorRef} role="alert" tabIndex={-1}>
          {getAiTaskErrorMessage(operationErrorCode)}
        </StyledError>
      )}
      {task.allowedOperations.includes('cancel') && (
        <StyledActions>
          <Button
            size="sm"
            variant="outline"
            startIcon={<IconPlayerStop />}
            disabled={isCancelling}
            loading={isCancelling}
            onClick={() => void stopTask()}
          >
            {t`Stop task`}
          </Button>
        </StyledActions>
      )}
    </StyledAiChatAskCard>
  );
};

type AiChatTaskStatusCardProps = {
  taskId: string;
};

// The persistent status block for a background task. It always shows live
// state from the server, so returning to an old thread shows what actually
// happened since.
export const AiChatTaskStatusCard = ({ taskId }: AiChatTaskStatusCardProps) => {
  const { t } = useLingui();
  const state = useAiTaskState(taskId);

  switch (state.status) {
    case 'loading':
      return (
        <StyledAiChatAskCard>
          <StyledLoading role="status">{t`Loading the task…`}</StyledLoading>
        </StyledAiChatAskCard>
      );
    case 'unavailable':
      return (
        <StyledAiChatAskCard>
          <StyledLoading>{t`This task is not available.`}</StyledLoading>
        </StyledAiChatAskCard>
      );
    case 'unsupported-version':
      return <AiChatInteractionFallback />;
    case 'available':
      return <AiChatTaskStatusCardContent task={state.task} />;
  }
};
