import 'twenty-ui/style.css';

import styled from '@emotion/styled';
import { enqueueSnackbar } from 'twenty-sdk/front-component';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';

import { useRequestBackfill } from 'src/front-components/hooks/use-request-backfill';
import { getBackfillFeedback } from 'src/front-components/utils/get-backfill-feedback.util';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[8]};
  width: 100%;
`;

export const LastContactSettings = () => {
  const { requestBackfill, isRequestingBackfill } = useRequestBackfill();

  const handleBackfillClick = async () => {
    const outcome = await requestBackfill();
    const feedback = getBackfillFeedback(outcome);

    enqueueSnackbar({ message: feedback.message, variant: feedback.variant });
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
          disabled={isRequestingBackfill}
          onClick={handleBackfillClick}
        />
      </Section>
    </StyledContainer>
  );
};
