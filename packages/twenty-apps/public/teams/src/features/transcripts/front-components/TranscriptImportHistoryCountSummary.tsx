import { useTranslate } from 'twenty-sdk/front-component';

import { type TeamsTranscriptHistoryView } from 'src/features/transcripts/front-components/types/teams-transcript-history-view.type';
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
  const { t } = useTranslate();

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
      {view.toImportCount > 0 ? (
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
              ? t('Up to {minutes} min', {
                  minutes: view.importEstimate.count,
                })
              : t('Up to {hours} h', { hours: view.importEstimate.count })}
          </StyledSettingsHint>
        </>
      ) : (
        <StyledSettingsText>{t('Nothing new to import.')}</StyledSettingsText>
      )}
    </>
  );
};
