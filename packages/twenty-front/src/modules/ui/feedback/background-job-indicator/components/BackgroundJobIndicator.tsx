import {
  useBackgroundJobs,
  useBackgroundJob,
} from '@/ui/feedback/background-job-indicator/hooks/useBackgroundJob';
import type { BackgroundJobData } from '@/ui/feedback/background-job-indicator/states/backgroundJobState';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconCheck, IconAlertTriangle, IconX } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledStack = styled.div`
  position: fixed;
  bottom: ${themeCssVariables.spacing[4]};
  right: ${themeCssVariables.spacing[4]};
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledCard = styled.div`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  min-width: 320px;
  max-width: 420px;
`;

const StyledContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledLabel = styled.div`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledSubLabel = styled.div`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledBarTrack = styled.div`
  width: 100%;
  height: 4px;
  background: ${themeCssVariables.background.quaternary};
  border-radius: 2px;
  overflow: hidden;
`;

const StyledBarFill = styled.div<{ percent: number; color: string }>`
  height: 100%;
  width: ${({ percent }) => percent}%;
  background: ${({ color }) => color};
  border-radius: 2px;
  transition: width 0.5s ease;
`;

const StyledSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid ${themeCssVariables.border.color.medium};
  border-top-color: ${themeCssVariables.color.blue};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const BackgroundJobCard = ({ job }: { job: BackgroundJobData }) => {
  const { removeJob } = useBackgroundJob();

  const isRunning = job.status === 'pending' || job.status === 'processing';
  const isDone = job.status === 'completed';
  const isFailed = job.status === 'failed';
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
      {isRunning && <StyledSpinner />}
      {isDone && (
        <IconCheck size={16} color={themeCssVariables.color.green} />
      )}
      {isFailed && (
        <IconAlertTriangle size={16} color={themeCssVariables.color.red} />
      )}
      {job.status === 'cancelled' && <IconX size={16} />}

      <StyledContent>
        <StyledLabel>
          {isRunning && job.label}
          {isDone &&
            (job.warningCount > 0
              ? t`${job.label} — done with ${job.warningCount} warnings`
              : t`${job.label} — done`)}
          {isFailed && t`${job.label} — failed`}
          {job.status === 'cancelled' && t`${job.label} — cancelled`}
        </StyledLabel>

        {isRunning && (
          <>
            <StyledBarTrack>
              <StyledBarFill percent={percent} color={barColor} />
            </StyledBarTrack>
            <StyledSubLabel>
              {t`${job.processedItems} of ${job.totalItems} (${percent}%)`}
              {job.warningCount > 0 && ` · ${job.warningCount} warnings`}
            </StyledSubLabel>
          </>
        )}

        {!isRunning && job.failureCount > 0 && (
          <StyledSubLabel>{t`${job.failureCount} failures`}</StyledSubLabel>
        )}
      </StyledContent>

      {!isRunning && (
        <LightIconButton
          Icon={IconX}
          size="small"
          onClick={() => removeJob(job.id)}
          accent="tertiary"
        />
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
