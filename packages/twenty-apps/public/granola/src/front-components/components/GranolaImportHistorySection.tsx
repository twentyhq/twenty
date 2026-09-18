import styled from '@emotion/styled';
import { useId, useState } from 'react';
import { t } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';

import { GRANOLA_BACKFILL_ROUTE_PATH } from 'src/constants/granola-backfill-route-path';
import { GRANOLA_HISTORY_MAX_IMPORT_DAYS } from 'src/constants/granola-history.constant';
import { StyledSettingsError } from 'src/front-components/components/StyledSettingsError';
import { StyledSettingsHint } from 'src/front-components/components/StyledSettingsHint';
import { StyledSettingsSectionStack } from 'src/front-components/components/StyledSettingsSectionStack';
import { StyledSettingsTextInput } from 'src/front-components/components/StyledSettingsTextInput';
import { DEFAULT_GRANOLA_HISTORY_IMPORT_DAYS } from 'src/front-components/constants/default-granola-history-import-days.constant';
import { parseHistoryImportDays } from 'src/front-components/utils/parse-history-import-days.util';
import { postGranolaSettingsRouteOrThrow } from 'src/front-components/utils/post-granola-settings-route-or-throw.util';

const StyledRow = styled.form`
  align-items: center;
  display: flex;
  gap: ${() => themeCssVariables.spacing[2]};
`;

const StyledDaysInputContainer = styled.div`
  display: flex;
  width: ${() => themeCssVariables.spacing[20]};
`;

const StyledRowLabel = styled.label`
  color: ${() => themeCssVariables.font.color.secondary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.md};
`;

type ImportFeedback = { kind: 'success' | 'error'; message: string };

export const GranolaImportHistorySection = () => {
  const inputId = useId();
  const [daysDraft, setDaysDraft] = useState(
    String(DEFAULT_GRANOLA_HISTORY_IMPORT_DAYS),
  );
  const [isImporting, setIsImporting] = useState(false);
  const [feedback, setFeedback] = useState<ImportFeedback | undefined>(
    undefined,
  );

  const days = parseHistoryImportDays(daysDraft);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isDefined(days)) {
      return;
    }

    setIsImporting(true);
    setFeedback(undefined);

    try {
      await postGranolaSettingsRouteOrThrow({
        routePath: GRANOLA_BACKFILL_ROUTE_PATH,
        body: { days },
      });
      setFeedback({
        kind: 'success',
        message: t(
          'Import started. Notes from the last {days} days will appear in Call Recordings over the next few hours.',
          { days },
        ),
      });
    } catch (error) {
      setFeedback({
        kind: 'error',
        message:
          error instanceof Error
            ? error.message
            : t('Could not start the import. Try again.'),
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Section>
      <H2Title
        title={t('Import history')}
        description={t(
          'Bring older notes from the synced folders into Call Recordings. Recordings you deleted in Twenty stay deleted.',
        )}
      />
      <StyledSettingsSectionStack>
        <StyledRow onSubmit={handleSubmit}>
          <StyledRowLabel htmlFor={inputId}>
            {t('Import the last')}
          </StyledRowLabel>
          <StyledDaysInputContainer>
            <StyledSettingsTextInput
              id={inputId}
              type="number"
              min={1}
              max={GRANOLA_HISTORY_MAX_IMPORT_DAYS}
              step={1}
              value={daysDraft}
              disabled={isImporting}
              onChange={(event) => setDaysDraft(event.target.value)}
            />
          </StyledDaysInputContainer>
          <StyledRowLabel htmlFor={inputId}>{t('days')}</StyledRowLabel>
          <Button
            type="submit"
            title={t('Import')}
            isLoading={isImporting}
            disabled={isImporting || !isDefined(days)}
          />
        </StyledRow>
        {!isDefined(days) && (
          <StyledSettingsError>
            {t('Enter a whole number of days between 1 and {max}.', {
              max: GRANOLA_HISTORY_MAX_IMPORT_DAYS,
            })}
          </StyledSettingsError>
        )}
        {feedback?.kind === 'success' && (
          <StyledSettingsHint>{feedback.message}</StyledSettingsHint>
        )}
        {feedback?.kind === 'error' && (
          <StyledSettingsError>{feedback.message}</StyledSettingsError>
        )}
      </StyledSettingsSectionStack>
    </Section>
  );
};
