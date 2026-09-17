import 'twenty-ui/style.css';
import 'twenty-ui/theme-light.css';
import 'twenty-ui/theme-dark.css';

import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';
import { enqueueSnackbar, useColorScheme } from 'twenty-sdk/front-component';
import { IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { ThemeProvider, themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';

import { ProgressRing } from 'src/front-components/components/ProgressRing';
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

const StyledActionRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${() => themeCssVariables.spacing[3]};
`;

// Mirrors the ring-and-caption row twenty-front uses for usage meters.
const StyledProgressRow = styled.div`
  align-items: center;
  color: ${() => themeCssVariables.font.color.tertiary};
  display: flex;
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  font-weight: ${() => themeCssVariables.font.weight.medium};
  gap: ${() => themeCssVariables.spacing[2]};
  white-space: nowrap;
`;

export const LastContactSettings = () => {
  const colorScheme = useColorScheme();
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

  // ThemeProvider applies the color-scheme class the theme CSS variables hang
  // off, without which every token above resolves to nothing.
  return (
    <ThemeProvider colorScheme={colorScheme}>
      <StyledContainer>
        <Section>
          <H2Title
            title="Backfill last contact"
            description="Recompute every record from your synced emails and meetings."
          />
          <StyledActionRow>
            <Button
              title="Run backfill"
              Icon={IconRefresh}
              variant="primary"
              accent="blue"
              disabled={isRequestingBackfill || isRunInFlight}
              isLoading={isRequestingBackfill}
              onClick={handleBackfillClick}
            />
            {!isUndefined(progressMessage) && (
              <StyledProgressRow>
                {!isUndefined(progressPercentage) && (
                  <ProgressRing value={progressPercentage} />
                )}
                <span>{progressMessage}</span>
              </StyledProgressRow>
            )}
          </StyledActionRow>
        </Section>
      </StyledContainer>
    </ThemeProvider>
  );
};
