import { useTranslate } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';

import { type TeamsTranscriptHistoryView } from 'src/features/transcripts/front-components/types/teams-transcript-history-view.type';
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
        date: new Date(view.checkedThrough).toLocaleDateString(locale),
      });
    }

    return t('Imported {importedCount}', { importedCount: view.importedCount });
  };

  return (
    <>
      <StyledSettingsText>
        {view.kind === 'importing'
          ? t('Importing transcripts...')
          : t('Import finished.')}
      </StyledSettingsText>
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
