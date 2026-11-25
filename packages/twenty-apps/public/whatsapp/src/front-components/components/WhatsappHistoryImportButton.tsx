import styled from '@emotion/styled';
import { t } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { IconDownload, IconRefresh } from 'twenty-ui/icon';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { AnimatedCount } from 'src/front-components/components/AnimatedCount';
import { formatWhatsappSyncProgressLabel } from 'src/front-components/utils/format-whatsapp-sync-progress-label.util';
import { getWhatsappHistoryImportErrorReason } from 'src/front-components/utils/get-whatsapp-history-import-error-reason.util';
import { type WhatsappHistoryImportState } from 'src/types/whatsapp-history-import-state.type';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[2]};
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${() => themeCssVariables.spacing[4]};
  justify-content: flex-end;
`;

const StyledLastImport = styled.div`
  flex: 1;
  min-width: 0;
`;

const StyledCaption = styled.div`
  text-align: right;
`;

type WhatsappHistoryImportButtonProps = {
  historyImport: WhatsappHistoryImportState | null;
  progress: number | undefined;
  isStarting: boolean;
  isCancelling: boolean;
  onImport: () => void;
  onCancel: () => void;
};

export const WhatsappHistoryImportButton = ({
  historyImport,
  progress,
  isStarting,
  isCancelling,
  onImport,
  onCancel,
}: WhatsappHistoryImportButtonProps) => {
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
        progress: formatWhatsappSyncProgressLabel(progress),
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
        'WhatsApp limits how fast conversations can be imported. The import resumes {resumeAt}.',
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
      {hasFailed && (
        <InlineBanner layout="compact" status="error" role="alert" fullWidth>
          {t('The import stopped before finishing.')}{' '}
          {getWhatsappHistoryImportErrorReason(historyImport.error)}
        </InlineBanner>
      )}
      <StyledRow>
        {hasCompleted && (
          <Text size="sm" color="tertiary" render={<StyledLastImport />}>
            {t('Last import on {date}: {count} conversations imported', {
              date: new Date(historyImport.startedAt).toLocaleString(
                undefined,
                { dateStyle: 'medium', timeStyle: 'short' },
              ),
              count: historyImport.importedConversationCount,
            })}
          </Text>
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
        <Text
          size="sm"
          color="tertiary"
          aria-live="polite"
          render={<StyledCaption />}
        >
          {getRunningCaption()}
        </Text>
      )}
    </StyledContainer>
  );
};
