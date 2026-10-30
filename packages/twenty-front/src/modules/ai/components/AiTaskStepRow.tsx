import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  type SetuAiTaskStepProjection,
  validateAiFormAnswers,
} from 'twenty-shared/ai';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import {
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconClock,
  IconLoader,
  IconPlayerStop,
  IconQuestionMark,
  IconRefresh,
  IconX,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiResearchBriefView } from '@/ai/components/AiResearchBriefView';
import { getAiTaskErrorMessage } from '@/ai/utils/getAiTaskErrorMessage';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { WorkflowFormFields } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowFormFields';

const StyledRow = styled.li`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  list-style: none;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledRowHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledIcon = styled.span<{ color: string }>`
  color: ${({ color }) => color};
  display: inline-flex;
  flex-shrink: 0;
`;

const StyledText = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
`;

const StyledCompany = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledDetail = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledTime = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledInput = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[2]};
`;

const StyledPrompt = styled.p`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
`;

const StyledError = styled.p`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
`;

const StyledRowActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
`;

const StyledToggle = styled.button`
  align-items: center;
  background: none;
  border: none;
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: inline-flex;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  margin-top: ${themeCssVariables.spacing[1]};
  padding: 0;
`;

type AiTaskStepRowProps = {
  step: SetuAiTaskStepProjection;
  onAnswer: (values: Record<string, unknown>) => Promise<boolean>;
  onRetry: () => Promise<boolean>;
};

export const AiTaskStepRow = ({
  step,
  onAnswer,
  onRetry,
}: AiTaskStepRowProps) => {
  const { t } = useLingui();
  const focusId = useId();
  const [isBriefOpen, setIsBriefOpen] = useState(false);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const brief = step.brief;
  const statusDisplay = (() => {
    switch (step.status) {
      case 'completed':
        return {
          icon: <IconCheck size={16} />,
          color: themeCssVariables.color.green,
          detail: isDefined(brief?.savedNoteId)
            ? t`Brief saved as a company note`
            : t`Brief ready`,
        };
      case 'running':
        return {
          icon: <IconLoader size={16} />,
          color: themeCssVariables.color.blue,
          detail: t`Researching…`,
        };
      case 'waiting_input':
        return {
          icon: <IconQuestionMark size={16} />,
          color: themeCssVariables.color.orange,
          detail: t`Needs your answer`,
        };
      case 'failed':
        return {
          icon: <IconX size={16} />,
          color: themeCssVariables.color.red,
          detail: getAiTaskErrorMessage(step.errorCode),
        };
      case 'cancelled':
        return {
          icon: <IconPlayerStop size={16} />,
          color: themeCssVariables.font.color.tertiary,
          detail: t`Stopped`,
        };
      default:
        return {
          icon: <IconClock size={16} />,
          color: themeCssVariables.font.color.tertiary,
          detail: t`Waiting to start`,
        };
    }
  })();

  // Mirrors the server's checks so a person sees what to fix first; the
  // server still validates the answer against the exact pending version.
  const submitAnswer = async () => {
    if (step.pendingInput === null) {
      return;
    }

    const errors = validateAiFormAnswers({
      fields: step.pendingInput.fields,
      values,
    });

    setValidationErrors(errors);

    if (errors.length > 0) {
      return;
    }

    setIsSubmitting(true);
    await onAnswer(values);
    setIsSubmitting(false);
  };

  const retry = async () => {
    setIsSubmitting(true);
    await onRetry();
    setIsSubmitting(false);
  };

  return (
    <StyledRow>
      <StyledRowHeader>
        <StyledIcon color={statusDisplay.color} aria-hidden>
          {statusDisplay.icon}
        </StyledIcon>
        <StyledText>
          <StyledCompany>
            <Link
              to={getAppPath(AppPath.RecordShowPage, {
                objectNameSingular: 'company',
                objectRecordId: step.companyId,
              })}
            >
              {step.companyName}
            </Link>
          </StyledCompany>
          <StyledDetail>{statusDisplay.detail}</StyledDetail>
        </StyledText>
        {isDefined(step.completedAt) && (
          <StyledTime>
            {new Date(step.completedAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </StyledTime>
        )}
      </StyledRowHeader>
      {isDefined(brief) && (
        <>
          <StyledToggle
            type="button"
            aria-expanded={isBriefOpen}
            onClick={() => setIsBriefOpen((isOpen) => !isOpen)}
          >
            {isBriefOpen ? (
              <IconChevronUp size={14} />
            ) : (
              <IconChevronDown size={14} />
            )}
            {isBriefOpen ? t`Hide brief` : t`Show brief`}
          </StyledToggle>
          {isBriefOpen && <AiResearchBriefView brief={brief} />}
        </>
      )}
      {step.pendingInput !== null &&
        step.allowedOperations.includes('answer') && (
          <StyledInput
            onFocus={(event) => {
              if (
                event.target instanceof HTMLInputElement ||
                event.target instanceof HTMLTextAreaElement
              ) {
                pushFocusItemToFocusStack({
                  focusId,
                  component: {
                    type: FocusComponentType.TEXT_AREA,
                    instanceId: focusId,
                  },
                  globalHotkeysConfig: {
                    enableGlobalHotkeysConflictingWithKeyboard: false,
                  },
                });
              }
            }}
            onBlur={() => removeFocusItemFromFocusStackById({ focusId })}
          >
            <StyledPrompt>{step.pendingInput.prompt}</StyledPrompt>
            <WorkflowFormFields
              fields={step.pendingInput.fields}
              readonly={isSubmitting}
              onChange={(fieldName, value) =>
                setValues((previousValues) => ({
                  ...previousValues,
                  [fieldName]: value,
                }))
              }
            />
            {validationErrors.length > 0 && (
              <StyledError role="alert">
                {validationErrors.join(' ')}
              </StyledError>
            )}
            <StyledRowActions>
              <Button
                size="sm"
                variant="solid"
                color="accent"
                disabled={isSubmitting}
                loading={isSubmitting}
                onClick={() => void submitAnswer()}
              >
                {t`Continue research`}
              </Button>
            </StyledRowActions>
          </StyledInput>
        )}
      {step.allowedOperations.includes('retry') && (
        <StyledRowActions>
          <Button
            size="sm"
            variant="outline"
            startIcon={<IconRefresh />}
            disabled={isSubmitting}
            loading={isSubmitting}
            onClick={() => void retry()}
          >
            {t`Retry this account`}
          </Button>
        </StyledRowActions>
      )}
    </StyledRow>
  );
};
