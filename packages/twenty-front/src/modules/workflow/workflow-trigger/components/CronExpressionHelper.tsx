import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { InputHint } from '@/ui/input/components/InputHint';
import type { WorkflowCronTrigger } from '@/workflow/types/Workflow';
import { describeCronExpression } from '@/workflow/workflow-trigger/utils/cron-to-human/describeCronExpression';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { CronExpressionParser } from 'cron-parser';
import { type Locale } from 'date-fns';
import { useRecoilValue } from 'recoil';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { formatDateTimeString } from '~/utils/string/formatDateTimeString';

const convertScheduleToCronExpression = (
  trigger: WorkflowCronTrigger,
): string | null => {
  switch (trigger.settings.type) {
    case 'CUSTOM':
      return trigger.settings.pattern;
    case 'DAYS':
      return `${trigger.settings.schedule.minute} ${trigger.settings.schedule.hour} */${trigger.settings.schedule.day} * *`;
    case 'HOURS':
      return `${trigger.settings.schedule.minute} */${trigger.settings.schedule.hour} * * *`;
    case 'MINUTES':
      return `*/${trigger.settings.schedule.minute} * * * *`;
    default:
      return null;
  }
};

const getTriggerScheduleDescription = (
  trigger: WorkflowCronTrigger,
  localeCatalog?: Locale,
): string | null => {
  const cronExpression = convertScheduleToCronExpression(trigger);

  if (!cronExpression) {
    return null;
  }

  try {
    return describeCronExpression(
      cronExpression,
      { use24HourTimeFormat: true },
      localeCatalog,
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : t`Invalid cron expression`;
    return errorMessage;
  }
};

const getNextExecutions = (cronExpression: string): Date[] => {
  try {
    const interval = CronExpressionParser.parse(cronExpression, {
      tz: 'UTC',
    });
    return interval.take(3).map((date) => date.toDate());
  } catch {
    return [];
  }
};

const StyledContainer = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(4)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledUpcomingTime = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledExecutionItem = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-family: ${({ theme }) => theme.font.family};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  font-size: ${({ theme }) => theme.font.size.md};
  margin-bottom: ${({ theme }) => theme.spacing(0.5)};
`;

type CronExpressionHelperProps = {
  trigger: WorkflowCronTrigger;
  isVisible?: boolean;
};

export const CronExpressionHelper = ({
  trigger,
  isVisible = true,
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
    CronExpressionParser.parse(cronExpression);
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

  const nextExecutions = getNextExecutions(cronExpression);

  return (
    <StyledContainer>
      {nextExecutions.length > 0 && (
        <StyledSection>
          <StyledUpcomingTime>{t`Upcoming execution times (${timeZone})`}</StyledUpcomingTime>
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
