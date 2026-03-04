import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { InputHint } from '@/ui/input/components/InputHint';
import type { WorkflowCronTrigger } from '@/workflow/types/Workflow';
import { calculateNextExecutionsForMinuteInterval } from '@/workflow/workflow-trigger/utils/cron-to-human/utils/calculateNextExecutionsForMinuteInterval';
import { convertScheduleToCronExpression } from '@/workflow/workflow-trigger/utils/cron-to-human/utils/convertScheduleToCronExpression';
import { normalizeCronExpression } from '@/workflow/workflow-trigger/utils/cron-to-human/utils/normalizeCronExpression';
import { getTriggerScheduleDescription } from '@/workflow/workflow-trigger/utils/getTriggerScheduleDescription';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { CronExpressionParser } from 'cron-parser';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { formatDateTimeString } from '~/utils/string/formatDateTimeString';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const getNextExecutions = (
  cronExpression: string,
  trigger?: WorkflowCronTrigger,
): Date[] => {
  try {
    const normalized = normalizeCronExpression(cronExpression);

    /* For MINUTES type with interval > 30, calculate manually
     because cron's N pattern resets at hour boundaries and doesn't
     represent true continuous intervals for values > 30
     */
    if (
      trigger?.settings.type === 'MINUTES' &&
      trigger.settings.schedule.minute > 30
    ) {
      return calculateNextExecutionsForMinuteInterval(
        trigger.settings.schedule.minute,
      );
    }

    const interval = CronExpressionParser.parse(normalized, {
      tz: 'UTC',
    });
    return interval.take(3).map((date) => date.toDate());
  } catch {
    return [];
  }
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  margin-top: ${themeCssVariables.spacing[2]};
`;

const StyledSection = styled.div`
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

const StyledScheduleDescription = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledScheduleTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledExecutionItem = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin-top: ${themeCssVariables.spacing[0.5]};
`;

type CronExpressionHelperProps = {
  trigger: WorkflowCronTrigger;
  isVisible?: boolean;
  isScheduleVisible?: boolean;
  isUpcomingExecutionVisible?: boolean;
};

export const CronExpressionHelper = ({
  trigger,
  isVisible = true,
  isScheduleVisible = true,
  isUpcomingExecutionVisible = true,
}: CronExpressionHelperProps) => {
  const { timeZone, dateFormat, timeFormat } = useDateTimeFormat();
  const dateLocale = useAtomStateValue(dateLocaleState);

  if (!isVisible) {
    return null;
  }

  const cronExpression = convertScheduleToCronExpression(trigger);
  const customDescription = getTriggerScheduleDescription(
    trigger,
    dateLocale.localeCatalog,
  );

  if (!cronExpression) {
    return null;
  }

  let isValid = true;
  let errorMessage = '';

  try {
    const normalized = normalizeCronExpression(cronExpression);
    CronExpressionParser.parse(normalized);
  } catch (error) {
    isValid = false;
    errorMessage = error instanceof Error ? error.message : t`Unknown error`;
  }

  if (!isValid) {
    return (
      <StyledContainer>
        <InputHint danger>
          {errorMessage || t`Please check your cron expression syntax.`}
        </InputHint>
      </StyledContainer>
    );
  }

  const nextExecutions = getNextExecutions(cronExpression, trigger);

  return (
    <StyledContainer>
      {isScheduleVisible && (
        <StyledSection>
          <StyledScheduleTitle>{t`Schedule`}</StyledScheduleTitle>
          <StyledScheduleDescription>
            {customDescription}
          </StyledScheduleDescription>
        </StyledSection>
      )}
      {nextExecutions.length > 0 && isUpcomingExecutionVisible && (
        <StyledSection>
          <StyledScheduleTitle>{t`Upcoming execution time (${timeZone})`}</StyledScheduleTitle>
          {nextExecutions.slice(0, 3).map((execution, index) => (
            <StyledExecutionItem key={index}>
              {formatDateTimeString({
                value: execution.toISOString(),
                timeZone,
                dateFormat,
                timeFormat,
                localeCatalog: dateLocale.localeCatalog,
              })}
            </StyledExecutionItem>
          ))}
        </StyledSection>
      )}
    </StyledContainer>
  );
};
