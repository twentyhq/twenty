import styled from '@emotion/styled';
import { type FormEvent, useId, useState } from 'react';
import { enqueueSnackbar, useTranslate } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { TEAMS_TRANSCRIPT_HISTORY_COUNT_ROUTE_PATH } from 'src/features/transcripts/constants/teams-transcript-history-count-route-path';
import { TEAMS_TRANSCRIPT_HISTORY_IMPORT_ROUTE_PATH } from 'src/features/transcripts/constants/teams-transcript-history-import-route-path';
import { TEAMS_TRANSCRIPT_HISTORY_INITIAL_IMPORT_DAYS } from 'src/features/transcripts/constants/teams-transcript-history-initial-import-days';
import { TEAMS_TRANSCRIPT_HISTORY_MAX_DAYS } from 'src/features/transcripts/constants/teams-transcript-history-max-days';
import { TEAMS_TRANSCRIPT_HISTORY_STATUS_ROUTE_PATH } from 'src/features/transcripts/constants/teams-transcript-history-status-route-path';
import { TranscriptImportHistoryCountSummary } from 'src/features/transcripts/front-components/TranscriptImportHistoryCountSummary';
import { TranscriptImportHistoryProgress } from 'src/features/transcripts/front-components/TranscriptImportHistoryProgress';
import { TEAMS_TRANSCRIPT_HISTORY_DEFAULT_DAYS } from 'src/features/transcripts/front-components/constants/teams-transcript-history-default-days';
import { type TeamsTranscriptHistoryRouteRequest } from 'src/features/transcripts/front-components/types/teams-transcript-history-route-request.type';
import { type TeamsTranscriptHistoryView } from 'src/features/transcripts/front-components/types/teams-transcript-history-view.type';
import { getTeamsTranscriptHistoryFailureMessage } from 'src/features/transcripts/front-components/utils/get-teams-transcript-history-failure-message';
import { getTeamsTranscriptHistoryPollDelayMilliseconds } from 'src/features/transcripts/front-components/utils/get-teams-transcript-history-poll-delay-milliseconds';
import { getTeamsTranscriptHistoryRouteErrorMessage } from 'src/features/transcripts/front-components/utils/get-teams-transcript-history-route-error-message';
import { getTeamsTranscriptHistoryView } from 'src/features/transcripts/front-components/utils/get-teams-transcript-history-view';
import { parseTeamsTranscriptHistoryDays } from 'src/features/transcripts/front-components/utils/parse-teams-transcript-history-days';
import { postTeamsTranscriptHistoryRouteOrThrow } from 'src/features/transcripts/front-components/utils/post-teams-transcript-history-route-or-throw';
import { type TeamsTranscriptHistoryRouteErrorCode } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-route-error-code.type';
import { StyledSettingsButton } from 'src/front-components/components/StyledSettingsButton';
import { StyledSettingsHint } from 'src/front-components/components/StyledSettingsHint';
import { StyledSettingsText } from 'src/front-components/components/StyledSettingsText';
import { TimeoutEffect } from 'src/front-components/components/TimeoutEffect';

const StyledSection = styled.section`
  color: ${() => themeCssVariables.font.color.primary};
  display: flex;
  flex-direction: column;
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.md};
  gap: ${() => themeCssVariables.spacing[3]};
`;

const StyledTitle = styled.h2`
  font-size: ${() => themeCssVariables.font.size.lg};
  font-weight: ${() => themeCssVariables.font.weight.medium};
  margin: 0;
`;

const StyledControl = styled.form`
  align-items: center;
  background: ${() => themeCssVariables.background.secondary};
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.md};
  display: flex;
  gap: ${() => themeCssVariables.spacing[2]};
  padding: ${() => themeCssVariables.spacing[4]};
`;

const StyledDaysInput = styled.input`
  background: ${() => themeCssVariables.background.primary};
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.sm};
  color: inherit;
  font: inherit;
  padding: ${() => themeCssVariables.spacing[1]}
    ${() => themeCssVariables.spacing[2]};
  width: ${() => themeCssVariables.spacing[16]};
`;

export const TranscriptImportHistorySection = () => {
  const { t, locale } = useTranslate();
  const titleId = useId();
  const daysInputId = useId();
  const [daysDraft, setDaysDraft] = useState(
    String(TEAMS_TRANSCRIPT_HISTORY_DEFAULT_DAYS),
  );
  const [view, setView] = useState<TeamsTranscriptHistoryView | undefined>();
  const [loadErrorCode, setLoadErrorCode] = useState<
    TeamsTranscriptHistoryRouteErrorCode | undefined
  >();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  const days = parseTeamsTranscriptHistoryDays(daysDraft);
  const isCounting = view?.kind === 'counting';
  const pollDelayMilliseconds = getTeamsTranscriptHistoryPollDelayMilliseconds({
    view,
    hasLoadError: isDefined(loadErrorCode),
  });

  const loadHistory = async () => {
    try {
      const result = await postTeamsTranscriptHistoryRouteOrThrow({
        routePath: TEAMS_TRANSCRIPT_HISTORY_STATUS_ROUTE_PATH,
        body: {},
      });

      if (result.success) {
        setView(getTeamsTranscriptHistoryView(result));
        setLoadErrorCode(undefined);
      } else {
        setLoadErrorCode(result.errorCode);
      }
    } catch {
      setLoadErrorCode('unknown');
    } finally {
      setPollCount((previousPollCount) => previousPollCount + 1);
    }
  };

  const startHistoryRun = async ({
    request,
    unknownErrorMessage,
  }: {
    request: TeamsTranscriptHistoryRouteRequest;
    unknownErrorMessage: string;
  }) => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await postTeamsTranscriptHistoryRouteOrThrow(request);

      if (result.success) {
        setView(getTeamsTranscriptHistoryView(result));
        setLoadErrorCode(undefined);
      } else {
        enqueueSnackbar({
          message: getTeamsTranscriptHistoryRouteErrorMessage({
            errorCode: result.errorCode,
            unknownErrorMessage,
          }),
          variant: 'error',
        });
        await loadHistory();
      }
    } catch {
      enqueueSnackbar({ message: unknownErrorMessage, variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHistoryRefresh = () => {
    void loadHistory();
  };

  const handleCountSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isDefined(days)) {
      void startHistoryRun({
        request: {
          routePath: TEAMS_TRANSCRIPT_HISTORY_COUNT_ROUTE_PATH,
          body: { days },
        },
        unknownErrorMessage: t('Could not start counting.'),
      });
    }
  };

  const handleImportClick = (runId: string) => {
    void startHistoryRun({
      request: {
        routePath: TEAMS_TRANSCRIPT_HISTORY_IMPORT_ROUTE_PATH,
        body: { runId },
      },
      unknownErrorMessage: t('Could not start the import.'),
    });
  };

  return (
    <StyledSection aria-labelledby={titleId}>
      {isDefined(pollDelayMilliseconds) && (
        <TimeoutEffect
          key={pollCount}
          delayMilliseconds={pollDelayMilliseconds}
          onTimeout={handleHistoryRefresh}
        />
      )}
      <StyledTitle id={titleId}>{t('Import history')}</StyledTitle>
      <StyledSettingsText>
        {t(
          'Import the transcripts of your past Teams meetings into Call Recordings. Recordings deleted in Twenty stay deleted.',
        )}
      </StyledSettingsText>
      {isDefined(loadErrorCode) && (
        <>
          <p role="alert">
            {getTeamsTranscriptHistoryRouteErrorMessage({
              errorCode: loadErrorCode,
              unknownErrorMessage: t('Could not load the import history.'),
            })}
          </p>
          <StyledSettingsButton type="button" onClick={handleHistoryRefresh}>
            {t('Retry')}
          </StyledSettingsButton>
        </>
      )}
      {view?.kind === 'stalled' && (
        <p role="alert">
          {t('The last run stopped before finishing. Count again to retry.')}
        </p>
      )}
      {view?.kind === 'failed' && (
        <p role="alert">
          {getTeamsTranscriptHistoryFailureMessage(view.errorCode)}
        </p>
      )}
      {view?.kind === 'counting' && (
        <StyledSettingsText>
          {isDefined(view.checkedThrough)
            ? t('Counting transcripts... checked back to {date}', {
                date: new Date(view.checkedThrough).toLocaleDateString(locale),
              })
            : t('Counting transcripts...')}
        </StyledSettingsText>
      )}
      {(view?.kind === 'importing' || view?.kind === 'imported') && (
        <TranscriptImportHistoryProgress view={view} />
      )}
      {view?.kind === 'counted' && (
        <TranscriptImportHistoryCountSummary
          view={view}
          isSubmitting={isSubmitting}
          onImport={() => handleImportClick(view.runId)}
        />
      )}
      {view?.kind !== 'importing' && (
        <>
          <StyledControl onSubmit={handleCountSubmit}>
            <StyledDaysInput
              id={daysInputId}
              type="number"
              min={1}
              max={TEAMS_TRANSCRIPT_HISTORY_MAX_DAYS}
              step={1}
              aria-label={t('Days to count')}
              value={daysDraft}
              disabled={!isDefined(view) || isCounting || isSubmitting}
              onChange={(event) => setDaysDraft(event.target.value)}
            />
            <label htmlFor={daysInputId}>{t('days')}</label>
            <StyledSettingsButton
              type="submit"
              aria-busy={isCounting || isSubmitting}
              disabled={
                !isDefined(view) ||
                !isDefined(days) ||
                isCounting ||
                isSubmitting
              }
            >
              {t('Count transcripts')}
            </StyledSettingsButton>
          </StyledControl>
          {!isDefined(days) && (
            <p role="alert">
              {t('Enter a whole number of days between 1 and {maxDays}.', {
                maxDays: TEAMS_TRANSCRIPT_HISTORY_MAX_DAYS,
              })}
            </p>
          )}
          <StyledSettingsHint>
            {t('Connecting imports the last {days} days.', {
              days: TEAMS_TRANSCRIPT_HISTORY_INITIAL_IMPORT_DAYS,
            })}
          </StyledSettingsHint>
        </>
      )}
    </StyledSection>
  );
};
