import { useTranslate } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_TRANSCRIPT_HISTORY_MAX_IMPORT_COUNT } from 'src/features/transcripts/constants/teams-transcript-history-max-import-count';
import { type TeamsTranscriptHistoryView } from 'src/features/transcripts/front-components/types/teams-transcript-history-view.type';
import { formatTeamsTranscriptHistoryCount } from 'src/features/transcripts/front-components/utils/format-teams-transcript-history-count';
import { formatTeamsTranscriptHistoryDate } from 'src/features/transcripts/front-components/utils/format-teams-transcript-history-date';
import { StyledSettingsFigureList } from 'src/front-components/components/StyledSettingsFigureList';
import { StyledSettingsText } from 'src/front-components/components/StyledSettingsText';

type TranscriptImportHistoryProgressProps = {
  view: Extract<TeamsTranscriptHistoryView, { kind: 'importing' | 'imported' }>;
};

export const TranscriptImportHistoryProgress = ({
  view,
}: TranscriptImportHistoryProgressProps) => {
  const { t, locale } = useTranslate();

  const getImportedText = () => {
    if (isDefined(view.toImportCount)) {
      return t('Imported {importedCount} of {toImportCount}', {
        importedCount: view.importedCount,
        toImportCount: view.toImportCount,
      });
    }

    if (isDefined(view.checkedThrough)) {
      return t('Imported {importedCount}, checked back to {date}', {
        importedCount: view.importedCount,
        date: formatTeamsTranscriptHistoryDate({
          date: view.checkedThrough,
          locale,
        }),
      });
    }

    return t('Imported {importedCount}', { importedCount: view.importedCount });
  };

  const getStatusText = () => {
    if (view.kind === 'importing') {
      return t('Importing transcripts...');
    }

    return view.isImportLimitReached
      ? t(
          'Import stopped at the limit of {maxImportCount} transcripts. Count again to see what is left.',
          {
            maxImportCount: formatTeamsTranscriptHistoryCount({
              count: TEAMS_TRANSCRIPT_HISTORY_MAX_IMPORT_COUNT,
              locale,
            }),
          },
        )
      : t('Import finished.');
  };

  return (
    <>
      <StyledSettingsText>{getStatusText()}</StyledSettingsText>
      <StyledSettingsFigureList>
        <li>{getImportedText()}</li>
        <li>
          {t('Already in Twenty or deleted: {skippedCount}', {
            skippedCount: view.skippedCount,
          })}
        </li>
        <li>
          {t('Not available from Microsoft: {unavailableCount}', {
            unavailableCount: view.unavailableCount,
          })}
        </li>
      </StyledSettingsFigureList>
    </>
  );
};
