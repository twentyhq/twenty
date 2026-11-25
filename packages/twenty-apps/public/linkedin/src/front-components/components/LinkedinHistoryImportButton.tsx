import styled from '@emotion/styled';
import { t } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { IconDownload, IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { AnimatedCount } from 'src/front-components/components/AnimatedCount';
import { formatLinkedinSyncProgressLabel } from 'src/front-components/utils/format-linkedin-sync-progress-label.util';
import { getLinkedinHistoryImportErrorReason } from 'src/front-components/utils/get-linkedin-history-import-error-reason.util';
import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[2]};
`;

const StyledCaption = styled.p`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-size: ${() => themeCssVariables.font.size.sm};
  margin: 0;
  text-align: right;
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${() => themeCssVariables.spacing[4]};
  justify-content: flex-end;
`;

const StyledLastImport = styled.p`
  color: ${() => themeCssVariables.font.color.tertiary};
  flex: 1;
  font-size: ${() => themeCssVariables.font.size.sm};
  margin: 0;
  min-width: 0;
`;

const StyledError = styled.p`
  color: ${() => themeCssVariables.color.red};
  flex: 1;
  font-size: ${() => themeCssVariables.font.size.sm};
  margin: 0;
  min-width: 0;
`;

const StyledErrorTitle = styled.span`
  font-weight: ${() => themeCssVariables.font.weight.medium};
`;

type LinkedinHistoryImportButtonProps = {
  historyImport: LinkedinHistoryImportState | null;
  progress: number | undefined;
  isStarting: boolean;
  isCancelling: boolean;
  onImport: () => void;
  onCancel: () => void;
};

export const LinkedinHistoryImportButton = ({
  historyImport,
  progress,
  isStarting,
  isCancelling,
  onImport,
  onCancel,
}: LinkedinHistoryImportButtonProps) => {
  const isRunning = historyImport?.status === 'IMPORTING';
  const hasFailed = historyImport?.status === 'FAILED';
  const hasCompleted = historyImport?.status === 'COMPLETED';

  const isListing =
    isRunning &&
    !isDefined(historyImport.chunkCount) &&
    !isDefined(historyImport.totalConversationCount);

  const getLabel = (): string => {
    if (isRunning && isDefined(progress)) {
      return t('Importing {progress}', {
        progress: formatLinkedinSyncProgressLabel(progress),
      });
    }

    if (isRunning) {
      return t('Importing…');
    }

    if (hasFailed) {
      return t('Retry');
    }

    return hasCompleted ? t('Import again') : t('Import conversations');
  };

  const getRunningCaption = () => {
    if (!isRunning) {
      return null;
    }

    if (isDefined(historyImport.resumeAt)) {
      return t(
        'LinkedIn limits how much can be imported each day. The import resumes {resumeAt}.',
        {
          resumeAt: new Date(historyImport.resumeAt).toLocaleString(undefined, {
            weekday: 'short',
            hour: 'numeric',
            minute: '2-digit',
          }),
        },
      );
    }

    if (isListing) {
      return (
        <>
          {t('Listing conversations')} (
          <AnimatedCount count={historyImport.plannedConversationCount ?? 0} />)
        </>
      );
    }

    return t('You can leave this page, the import keeps running.');
  };

  return (
    <StyledContainer>
      <StyledRow>
        {hasFailed && (
          <StyledError role="alert">
            <StyledErrorTitle>
              {t('The import stopped before finishing.')}
            </StyledErrorTitle>{' '}
            {getLinkedinHistoryImportErrorReason(historyImport.error)}
          </StyledError>
        )}
        {hasCompleted && (
          <StyledLastImport>
            {t('Last import on {date}: {count} conversations imported', {
              date: new Date(historyImport.startedAt).toLocaleString(
                undefined,
                { dateStyle: 'medium', timeStyle: 'short' },
              ),
              count: historyImport.importedConversationCount,
            })}
          </StyledLastImport>
        )}
        {isRunning && (
          <Button
            variant="outline"
            size="md"
            onClick={onCancel}
            loading={isCancelling}
            disabled={isCancelling}
          >
            {t('Cancel')}
          </Button>
        )}
        <Button
          startIcon={hasFailed ? <IconRefresh /> : <IconDownload />}
          variant="solid"
          color="accent"
          size="md"
          onClick={onImport}
          loading={isRunning || isStarting}
          loadingPosition="end"
        >
          {getLabel()}
        </Button>
      </StyledRow>
      {isRunning && (
        <StyledCaption aria-live="polite">{getRunningCaption()}</StyledCaption>
      )}
    </StyledContainer>
  );
};
