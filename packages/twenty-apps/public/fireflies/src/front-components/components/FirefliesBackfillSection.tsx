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

export const FirefliesBackfillSection = () => {
  const [daysDraftValue, setDaysDraftValue] = useState(
    String(DEFAULT_FIREFLIES_BACKFILL_DAYS),
  );
  const { requestFirefliesBackfill, isRequestingFirefliesBackfill } =
    useRequestFirefliesBackfill();

  const parsedDays = parseBackfillDays(daysDraftValue);
  const isStartDisabled =
    isUndefined(parsedDays) || isRequestingFirefliesBackfill;

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
        description="Imports Fireflies calls from the chosen period into call recordings. Already-imported calls are skipped, and the import runs in the background after it starts."
      />
      <StyledRow>
        <StyledDaysInputContainer>
          <StyledSettingsTextInput
            type="number"
            min="1"
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
    </StyledSection>
  );
};
