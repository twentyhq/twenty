import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { InputHint } from '@/ui/input/components/InputHint';
import type { WorkflowCronTrigger } from '@/workflow/types/Workflow';
import { calculateNextExecutionsForMinuteInterval } from '@/workflow/workflow-trigger/utils/cron-to-human/utils/calculateNextExecutionsForMinuteInterval';
import { convertScheduleToCronExpression } from '@/workflow/workflow-trigger/utils/cron-to-human/utils/convertScheduleToCronExpression';
import { normalizeCronExpression } from '@/workflow/workflow-trigger/utils/cron-to-human/utils/normalizeCronExpression';
import { getTriggerScheduleDescription } from '@/workflow/workflow-trigger/utils/getTriggerScheduleDescription';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { CronExpressionParser } from 'cron-parser';
import { useRecoilValue } from 'recoil';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { formatDateTimeString } from '~/utils/string/formatDateTimeString';

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
  gap: ${({ theme }) => theme.spacing(3)};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledSection = styled.div`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};
`;

const StyledScheduleDescription = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledScheduleTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledExecutionItem = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-top: ${({ theme }) => theme.spacing(0.5)};
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
  const dateLocale = useRecoilValue(dateLocaleState);

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
