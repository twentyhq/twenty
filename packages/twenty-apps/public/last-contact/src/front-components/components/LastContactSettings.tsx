import 'twenty-ui/style.css';

import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';
import { enqueueSnackbar } from 'twenty-sdk/front-component';
import { ProgressBar } from 'twenty-ui/feedback';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';

import { useBackfillStatus } from 'src/front-components/hooks/use-backfill-status';
import { useRequestBackfill } from 'src/front-components/hooks/use-request-backfill';
import { getBackfillFeedback } from 'src/front-components/utils/get-backfill-feedback.util';
import { getBackfillProgressMessage } from 'src/front-components/utils/get-backfill-progress-message.util';
import { getBackfillProgressPercentage } from 'src/front-components/utils/get-backfill-progress-percentage.util';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[8]};
  width: 100%;
`;

const StyledProgress = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[2]};
  margin-top: ${() => themeCssVariables.spacing[3]};
  max-width: ${() => themeCssVariables.spacing[32]};
`;

const StyledProgressLabel = styled.div`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
`;

export const LastContactSettings = () => {
  const { requestBackfill, isRequestingBackfill } = useRequestBackfill();
  const { backfillStatus, refetchBackfillStatus } = useBackfillStatus();

  const isRunInFlight =
    backfillStatus?.status === 'enqueueing' ||
    backfillStatus?.status === 'running';
  const progressMessage = getBackfillProgressMessage(backfillStatus);
  const progressPercentage = getBackfillProgressPercentage(backfillStatus);

  const handleBackfillClick = async () => {
    const outcome = await requestBackfill();
    const feedback = getBackfillFeedback(outcome);

    enqueueSnackbar({ message: feedback.message, variant: feedback.variant });
    refetchBackfillStatus();
  };

  return (
    <StyledContainer>
      <Section>
        <H2Title
          title="Backfill last contact"
          description="Recomputes last contact on every existing person, company and opportunity from your synced emails and meetings. Runs in the background, and already runs once when the app is installed."
        />
        <Button
          title={isRequestingBackfill ? 'Starting…' : 'Run backfill'}
          disabled={isRequestingBackfill || isRunInFlight}
          onClick={handleBackfillClick}
        />
        {!isUndefined(progressMessage) && (
          <StyledProgress>
            {!isUndefined(progressPercentage) && (
              <ProgressBar
                value={progressPercentage}
                ariaLabel="Backfill progress"
                withBorderRadius
              />
            )}
            <StyledProgressLabel>{progressMessage}</StyledProgressLabel>
          </StyledProgress>
        )}
      </Section>
    </StyledContainer>
  );
};
