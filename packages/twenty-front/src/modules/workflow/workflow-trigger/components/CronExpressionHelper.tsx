import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { InputHint } from '@/ui/input/components/InputHint';
import { InputLabel } from '@/ui/input/components/InputLabel';
import type { WorkflowCronTrigger } from '@/workflow/types/Workflow';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { CronExpressionParser } from 'cron-parser';
import { useRecoilValue } from 'recoil';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { formatDateTimeString } from '~/utils/string/formatDateTimeString';

// TODO: Move these to separate utility files when implementing full cron-to-human feature
const convertScheduleToCronExpression = (
  trigger: WorkflowCronTrigger,
): string | null => {
  // User enters time in UTC, cron expressions execute in UTC
  // Only the "Upcoming execution times" display is shown in user's timezone for clarity
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
): string | null => {
  // TODO: Generate human-readable descriptions using cronstrue or similar
  switch (trigger.settings.type) {
    case 'CUSTOM':
      return `Custom schedule: ${trigger.settings.pattern}`;
    case 'DAYS':
      return `Every ${trigger.settings.schedule.day} day(s) at ${String(trigger.settings.schedule.hour).padStart(2, '0')}:${String(trigger.settings.schedule.minute).padStart(2, '0')} UTC`;
    case 'HOURS':
      return `Every ${trigger.settings.schedule.hour} hour(s) at minute ${trigger.settings.schedule.minute} UTC`;
    case 'MINUTES':
      return `Every ${trigger.settings.schedule.minute} minute(s)`;
    default:
      return null;
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
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledScheduleDescription = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledScheduleSubtext = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
`;

const StyledExecutionItem = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-family: monospace;
  font-size: ${({ theme }) => theme.font.size.xs};
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
  const customDescription = getTriggerScheduleDescription(trigger);

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
      <StyledSection>
        <InputLabel>{t`Schedule`}</InputLabel>
        <StyledScheduleDescription>
          {customDescription}
        </StyledScheduleDescription>
        <StyledScheduleSubtext>
          {t`Schedule runs in UTC timezone.`}
        </StyledScheduleSubtext>
      </StyledSection>

      {nextExecutions.length > 0 && (
        <StyledSection>
          <InputLabel>{t`Upcoming execution times (${timeZone})`}</InputLabel>
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
