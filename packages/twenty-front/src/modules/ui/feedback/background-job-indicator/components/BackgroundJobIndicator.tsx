import {
  useBackgroundJob,
  useBackgroundJobs,
} from '@/ui/feedback/background-job-indicator/hooks/useBackgroundJob';
import type { BackgroundJobData } from '@/ui/feedback/background-job-indicator/states/backgroundJobState';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useEffect } from 'react';
import {
  IconAlertTriangle,
  IconSquareRoundedCheck,
  IconX,
} from 'twenty-ui/display';
import { CircularProgressBar, ProgressBar } from 'twenty-ui/feedback';
import { LightIconButton } from 'twenty-ui/input';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledStack = styled.div`
  bottom: ${themeCssVariables.spacing[3]};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  position: fixed;
  right: ${themeCssVariables.spacing[3]};
  z-index: 10000;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    left: 0;
    right: 0;
    bottom: 0;
  }
`;

const StyledCard = styled.div`
  backdrop-filter: ${themeCssVariables.blur.medium};
  background-color: ${themeCssVariables.background.transparent.primary};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  box-sizing: border-box;
  overflow: hidden;
  padding: ${themeCssVariables.spacing[2]};
  position: relative;
  width: 296px;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    border-radius: 0;
    width: 100%;
  }
`;

const StyledHeader = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledIcon = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
`;

const StyledMessage = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  flex: 1;
  font-size: ${themeCssVariables.font.size.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledActions = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  margin-left: auto;
`;

const StyledDetails = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  padding-left: ${themeCssVariables.spacing[6]};
  padding-top: ${themeCssVariables.spacing[1]};
`;

const StyledProgressContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[1]};
  padding-left: ${themeCssVariables.spacing[6]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const AUTO_DISMISS_MS = 5000;

const BackgroundJobCard = ({ job }: { job: BackgroundJobData }) => {
  const { removeJob } = useBackgroundJob();

  const isRunning = job.status === 'pending' || job.status === 'processing';
  const isDone = job.status === 'completed';
  const isFailed = job.status === 'failed';

  useEffect(() => {
    if (!isDone) return;

    const timer = setTimeout(() => removeJob(job.id), AUTO_DISMISS_MS);

    return () => clearTimeout(timer);
  }, [isDone, job.id, removeJob]);
  const percent =
    job.totalItems > 0
      ? Math.round((job.processedItems / job.totalItems) * 100)
      : 0;

  const barColor = isDone
    ? themeCssVariables.color.green
    : isFailed
      ? themeCssVariables.color.red
      : themeCssVariables.color.blue;

  return (
    <StyledCard>
      <StyledHeader>
        <StyledIcon>
          {isRunning && (
            <CircularProgressBar
              size={16}
              barWidth={2}
              barColor={themeCssVariables.color.blue}
            />
          )}
          {isDone && (
            <IconSquareRoundedCheck
              size={16}
              color={themeCssVariables.color.green}
            />
          )}
          {isFailed && (
            <IconAlertTriangle size={16} color={themeCssVariables.color.red} />
          )}
          {job.status === 'cancelled' && <IconX size={16} />}
        </StyledIcon>

        <StyledMessage>
          {isRunning && job.label}
          {isDone &&
            (job.warningCount > 0
              ? t`${job.label} — done with ${job.warningCount} warnings`
              : t`${job.label} — done`)}
          {isFailed && t`${job.label} — failed`}
          {job.status === 'cancelled' && t`${job.label} — cancelled`}
        </StyledMessage>

        <StyledActions>
          {!isRunning && (
            <LightIconButton
              Icon={IconX}
              size="small"
              onClick={() => removeJob(job.id)}
              accent="tertiary"
            />
          )}
        </StyledActions>
      </StyledHeader>

      {isRunning && (
        <>
          <StyledProgressContainer>
            <ProgressBar
              value={percent}
              barColor={barColor}
              backgroundColor={themeCssVariables.background.quaternary}
              withBorderRadius
            />
          </StyledProgressContainer>
          <StyledDetails>
            {t`${job.processedItems} of ${job.totalItems} (${percent}%)`}
            {job.warningCount > 0 && ` · ${job.warningCount} warnings`}
          </StyledDetails>
        </>
      )}

      {!isRunning && job.failureCount > 0 && (
        <StyledDetails>{t`${job.failureCount} failures`}</StyledDetails>
      )}
    </StyledCard>
  );
};

export const BackgroundJobIndicator = () => {
  const jobs = useBackgroundJobs();

  if (jobs.length === 0) return null;

  return (
    <StyledStack>
      {jobs.map((job) => (
        <BackgroundJobCard key={job.id} job={job} />
      ))}
    </StyledStack>
  );
};
