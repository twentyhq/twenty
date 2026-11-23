import styled from '@emotion/styled';
import { t } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
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

  const label = isRunning
    ? isDefined(progress)
      ? t('Syncing {progress}', {
          progress: formatWhatsappSyncProgressLabel(progress),
        })
      : t('Syncing…')
    : hasFailed
      ? t('Retry')
      : t('Sync now');

  return (
    <StyledContainer>
      <StyledRow>
        {hasFailed && (
          <StyledError role="alert">
            <StyledErrorTitle>
              {t('The import stopped before finishing.')}
            </StyledErrorTitle>{' '}
            {getWhatsappHistoryImportErrorReason(historyImport.error)}
          </StyledError>
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
          startIcon={<IconRefresh />}
          variant="solid"
          color="accent"
          size="md"
          onClick={onSync}
          loading={isRunning || isStarting}
          loadingPosition="end"
        >
          {label}
        </Button>
      </StyledRow>
      {isRunning && isDefined(historyImport.resumeAt) ? (
        <StyledCaption aria-live="polite">
          {t(
            'WhatsApp limits how fast conversations can be imported. The sync resumes {resumeAt}.',
            {
              resumeAt: new Date(historyImport.resumeAt).toLocaleString(
                undefined,
                { weekday: 'short', hour: 'numeric', minute: '2-digit' },
              ),
            },
          )}
        </StyledCaption>
      ) : (
        isListing && (
          <StyledCaption aria-live="polite">
            {t('Listing conversations')} (
            <AnimatedCount
              count={historyImport.plannedConversationCount ?? 0}
            />
            )
          </StyledCaption>
        )
      )}
    </StyledContainer>
  );
};
