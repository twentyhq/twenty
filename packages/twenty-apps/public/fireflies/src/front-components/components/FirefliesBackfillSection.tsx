import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';
import { useState } from 'react';
import { enqueueSnackbar } from 'twenty-sdk/front-component';
import { Button } from 'twenty-ui/input';
import { H2Title } from 'twenty-ui/typography';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { StyledSettingsTextInput } from 'src/front-components/components/StyledSettingsTextInput';
import { DEFAULT_FIREFLIES_BACKFILL_DAYS } from 'src/front-components/constants/default-fireflies-backfill-days.constant';
import { useRequestFirefliesBackfill } from 'src/front-components/hooks/use-request-fireflies-backfill';
import { getFirefliesBackfillFeedback } from 'src/front-components/utils/get-fireflies-backfill-feedback.util';
import { parseBackfillDays } from 'src/front-components/utils/parse-backfill-days.util';
import { FIREFLIES_BACKFILL_MAX_WINDOW_DAYS } from 'src/logic-functions/constants/fireflies-backfill-max-window-days.constant';

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${() => themeCssVariables.spacing[2]};
`;

const StyledDaysInputContainer = styled.div`
  display: flex;
  width: ${() => themeCssVariables.spacing[20]};
`;

const StyledDaysUnit = styled.span`
  color: ${() => themeCssVariables.font.color.secondary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
`;

const StyledHint = styled.span`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.xs};
  margin-top: ${() => themeCssVariables.spacing[2]};
`;

type FirefliesBackfillSectionProps = {
  isApiKeyConfigured: boolean;
};

export const FirefliesBackfillSection = ({
  isApiKeyConfigured,
}: FirefliesBackfillSectionProps) => {
  const [daysDraftValue, setDaysDraftValue] = useState(
    String(DEFAULT_FIREFLIES_BACKFILL_DAYS),
  );
  const { requestFirefliesBackfill, isRequestingFirefliesBackfill } =
    useRequestFirefliesBackfill();

  const parsedDays = parseBackfillDays(daysDraftValue);
  const isStartDisabled =
    !isApiKeyConfigured ||
    isUndefined(parsedDays) ||
    isRequestingFirefliesBackfill;

  const handleStartClick = async () => {
    if (isUndefined(parsedDays)) {
      return;
    }

    const outcome = await requestFirefliesBackfill(parsedDays);
    const feedback = getFirefliesBackfillFeedback(outcome);

    enqueueSnackbar({ message: feedback.message, variant: feedback.variant });
  };

  return (
    <StyledSection>
      <H2Title
        title="Import call history"
        description="Imports past Fireflies calls as call recordings. Already-imported calls are skipped."
      />
      <StyledRow>
        <StyledDaysInputContainer>
          <StyledSettingsTextInput
            aria-label="Days of call history to import"
            type="number"
            min="1"
            max={FIREFLIES_BACKFILL_MAX_WINDOW_DAYS}
            step="1"
            value={daysDraftValue}
            onChange={(event) => setDaysDraftValue(event.target.value)}
          />
        </StyledDaysInputContainer>
        <StyledDaysUnit>days</StyledDaysUnit>
        <Button
          title={isRequestingFirefliesBackfill ? 'Starting…' : 'Start backfill'}
          disabled={isStartDisabled}
          onClick={handleStartClick}
        />
      </StyledRow>
      {!isApiKeyConfigured && (
        <StyledHint>Set the Fireflies API key first.</StyledHint>
      )}
      {isApiKeyConfigured && isUndefined(parsedDays) && (
        <StyledHint>
          Enter a whole number of days between 1 and{' '}
          {FIREFLIES_BACKFILL_MAX_WINDOW_DAYS}.
        </StyledHint>
      )}
    </StyledSection>
  );
};
