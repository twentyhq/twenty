import { useTranslate } from 'twenty-sdk/front-component';

import { TEAMS_TRANSCRIPT_HISTORY_MAX_IMPORT_COUNT } from 'src/features/transcripts/constants/teams-transcript-history-max-import-count';
import { type TeamsTranscriptHistoryView } from 'src/features/transcripts/front-components/types/teams-transcript-history-view.type';
import { getTeamsTranscriptHistoryImportLimitMessage } from 'src/features/transcripts/front-components/utils/get-teams-transcript-history-import-limit-message';
import { StyledSettingsButton } from 'src/front-components/components/StyledSettingsButton';
import { StyledSettingsFigureList } from 'src/front-components/components/StyledSettingsFigureList';
import { StyledSettingsHint } from 'src/front-components/components/StyledSettingsHint';
import { StyledSettingsText } from 'src/front-components/components/StyledSettingsText';

type TranscriptImportHistoryCountSummaryProps = {
  view: Extract<TeamsTranscriptHistoryView, { kind: 'counted' }>;
  isSubmitting: boolean;
  onImport: () => void;
};

export const TranscriptImportHistoryCountSummary = ({
  view,
  isSubmitting,
  onImport,
}: TranscriptImportHistoryCountSummaryProps) => {
  const { t, locale } = useTranslate();

  const getImportAction = () => {
    if (view.toImportCount <= 0) {
      return (
        <StyledSettingsText>{t('Nothing new to import.')}</StyledSettingsText>
      );
    }

    if (view.toImportCount > TEAMS_TRANSCRIPT_HISTORY_MAX_IMPORT_COUNT) {
      return (
        <p role="alert">
          {getTeamsTranscriptHistoryImportLimitMessage(locale)}
        </p>
      );
    }

    return (
      <>
        <StyledSettingsButton
          type="button"
          disabled={isSubmitting}
          onClick={onImport}
        >
          {t('Import transcripts')}
        </StyledSettingsButton>
        <StyledSettingsHint>
          {view.importEstimate.unit === 'minute'
            ? t('About {minutes} min', {
                minutes: view.importEstimate.count,
              })
            : t('About {hours} h', { hours: view.importEstimate.count })}
        </StyledSettingsHint>
      </>
    );
  };

  return (
    <>
      <StyledSettingsText>
        {t('Last {days} days', { days: view.days })}
      </StyledSettingsText>
      <StyledSettingsFigureList>
        <li>
          {t('Transcripts found: {transcriptCount}', {
            transcriptCount: view.transcriptCount,
          })}
        </li>
        <li>
          {t('Already in Twenty: {alreadyImportedCount}', {
            alreadyImportedCount: view.alreadyImportedCount,
          })}
        </li>
        <li>
          {t('Deleted in Twenty: {deletedCount}', {
            deletedCount: view.deletedCount,
          })}
        </li>
        <li>
          {t('To import: {toImportCount}', {
            toImportCount: view.toImportCount,
          })}
        </li>
      </StyledSettingsFigureList>
      {getImportAction()}
    </>
  );
};
