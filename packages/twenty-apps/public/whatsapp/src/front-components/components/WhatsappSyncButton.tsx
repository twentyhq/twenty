import styled from '@emotion/styled';
import { t } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { IconRefresh } from 'twenty-ui/icon';
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

const StyledCaption = styled.div`
  text-align: right;
`;

type WhatsappSyncButtonProps = {
  historyImport: WhatsappHistoryImportState | null;
  progress: number | undefined;
  isStarting: boolean;
  isCancelling: boolean;
  onSync: () => void;
  onCancel: () => void;
};

export const WhatsappSyncButton = ({
  historyImport,
  progress,
  isStarting,
  isCancelling,
  onSync,
  onCancel,
}: WhatsappSyncButtonProps) => {
  const isRunning = historyImport?.status === 'IMPORTING';
  const hasFailed = historyImport?.status === 'FAILED';

  const isListing =
    isRunning &&
    !isDefined(historyImport.chunkCount) &&
    !isDefined(historyImport.totalConversationCount);

  const getLabel = (): string => {
    if (isRunning && isDefined(progress)) {
      return t('Syncing {progress}', {
        progress: formatWhatsappSyncProgressLabel(progress),
      });
    }

    if (isRunning) {
      return t('Syncing…');
    }

    return hasFailed ? t('Retry') : t('Sync now');
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
          startIcon={<IconRefresh />}
          variant="solid"
          color="accent"
          size="md"
          onClick={onSync}
          loading={isRunning || isStarting}
          loadingPosition="end"
        >
          {getLabel()}
        </Button>
      </StyledRow>
      {isRunning && isDefined(historyImport.resumeAt) ? (
        <Text
          size="sm"
          color="tertiary"
          aria-live="polite"
          render={<StyledCaption />}
        >
          {t(
            'WhatsApp limits how fast conversations can be imported. The sync resumes {resumeAt}.',
            {
              resumeAt: new Date(historyImport.resumeAt).toLocaleString(
                undefined,
                { weekday: 'short', hour: 'numeric', minute: '2-digit' },
              ),
            },
          )}
        </Text>
      ) : (
        isListing && (
          <Text
            size="sm"
            color="tertiary"
            aria-live="polite"
            render={<StyledCaption />}
          >
            {t('Listing conversations')} (
            <AnimatedCount
              count={historyImport.plannedConversationCount ?? 0}
            />
            )
          </Text>
        )
      )}
    </StyledContainer>
  );
};
