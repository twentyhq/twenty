import styled from '@emotion/styled';
import { useId, useState } from 'react';
import { enqueueSnackbar, t } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { IconFileImport } from 'twenty-ui/icon';
import { Button, Field, Input } from 'twenty-ui/primitives/input';
import { Section } from 'twenty-ui/components/layout';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

import { GRANOLA_BACKFILL_ROUTE_PATH } from 'src/constants/granola-backfill-route-path';
import {
  GRANOLA_HISTORY_MAX_IMPORT_DAYS,
  GRANOLA_INITIAL_IMPORT_DAYS,
} from 'src/constants/granola-history.constant';
import { SettingsOptionCardContent } from 'src/front-components/components/SettingsOptionCardContent';
import { StyledSettingsSectionStack } from 'src/front-components/components/StyledSettingsSectionStack';
import { DEFAULT_GRANOLA_HISTORY_IMPORT_DAYS } from 'src/front-components/constants/default-granola-history-import-days.constant';
import { parseHistoryImportDays } from 'src/front-components/utils/parse-history-import-days.util';
import { postGranolaSettingsRouteOrThrow } from 'src/front-components/utils/post-granola-settings-route-or-throw.util';

const StyledDaysInputContainer = styled.div`
  display: flex;
  width: ${() => themeCssVariables.spacing[16]};

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input {
    -moz-appearance: textfield;
  }
`;

const StyledDaysLabel = styled.label`
  color: ${() => themeCssVariables.font.color.secondary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.md};
`;

export const GranolaImportHistorySection = () => {
  const inputId = useId();
  const [daysDraft, setDaysDraft] = useState(
    String(DEFAULT_GRANOLA_HISTORY_IMPORT_DAYS),
  );
  const [isImporting, setIsImporting] = useState(false);

  const days = parseHistoryImportDays(daysDraft);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isDefined(days) || isImporting) {
      return;
    }

    setIsImporting(true);

    try {
      await postGranolaSettingsRouteOrThrow({
        routePath: GRANOLA_BACKFILL_ROUTE_PATH,
        body: { days },
      });
      enqueueSnackbar({
        message: t(
          'Import started. Notes from the last {days} days will appear in Call Recordings over the next few hours.',
          { days },
        ),
        variant: 'success',
      });
    } catch {
      enqueueSnackbar({
        message: t('Could not start the import. Try again.'),
        variant: 'error',
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Section.Root>
      <Section.Header
        title={t('Import history')}
        description={t(
          'Bring older notes from the synced folders into Call Recordings. Recordings you deleted in Twenty stay deleted.',
        )}
      />
      <form onSubmit={handleSubmit}>
        <Field.Root
          invalid={!isDefined(days)}
          render={<StyledSettingsSectionStack />}
        >
          <Card.Root fullWidth>
            <SettingsOptionCardContent
              Icon={IconFileImport}
              title={t('Import past notes')}
              description={t('The last {days} days import on connect.', {
                days: GRANOLA_INITIAL_IMPORT_DAYS,
              })}
            >
              <StyledDaysInputContainer>
                <Input
                  id={inputId}
                  type="number"
                  min={1}
                  max={GRANOLA_HISTORY_MAX_IMPORT_DAYS}
                  step={1}
                  aria-label={t('Days to import')}
                  value={daysDraft}
                  disabled={isImporting}
                  onValueChange={setDaysDraft}
                />
              </StyledDaysInputContainer>
              <StyledDaysLabel htmlFor={inputId}>{t('days')}</StyledDaysLabel>
              <Button
                type="submit"
                loading={isImporting}
                disabled={isImporting || !isDefined(days)}
              >
                {t('Import')}
              </Button>
            </SettingsOptionCardContent>
          </Card.Root>
          {!isDefined(days) && (
            <Field.Error match>
              {t('Enter a whole number of days between 1 and {max}.', {
                max: GRANOLA_HISTORY_MAX_IMPORT_DAYS,
              })}
            </Field.Error>
          )}
        </Field.Root>
      </form>
    </Section.Root>
  );
};
