import styled from '@emotion/styled';
import { t } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { Loader } from 'twenty-ui/primitives/feedback';
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
  gap: ${() => themeCssVariables.spacing[1]};
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${() => themeCssVariables.spacing[4]};
`;

const StyledProgress = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${() => themeCssVariables.spacing[2]};
  min-width: 0;
`;

type WhatsappHistoryImportStatusProps = {
  historyImport: WhatsappHistoryImportState;
  progress: number | undefined;
  isRetrying: boolean;
  isCancelling: boolean;
  onRetry: () => void;
  onCancel: () => void;
};

export const WhatsappHistoryImportStatus = ({
  historyImport,
  progress,
  isRetrying,
  isCancelling,
  onRetry,
  onCancel,
}: WhatsappHistoryImportStatusProps) => {
  if (historyImport.status === 'FAILED') {
    return (
      <InlineBanner
        layout="compact"
        status="error"
        role="alert"
        fullWidth
        action={
          <InlineBanner.Action onClick={onRetry} disabled={isRetrying}>
            {t('Retry')}
          </InlineBanner.Action>
        }
      >
        {t('The import stopped before finishing.')}{' '}
        {getWhatsappHistoryImportErrorReason(historyImport.error)}
      </InlineBanner>
    );
  }

  const isListing =
    !isDefined(historyImport.chunkCount) &&
    !isDefined(historyImport.totalConversationCount);

  return (
    <StyledContainer aria-live="polite">
      <StyledRow>
        <Text color="secondary" render={<StyledProgress />}>
          <Loader />
          {isDefined(progress)
            ? t('Importing past conversations {progress}', {
                progress: formatWhatsappSyncProgressLabel(progress),
              })
            : t('Importing past conversations…')}
        </Text>
        <Button
          variant="outline"
          size="md"
          onClick={onCancel}
          loading={isCancelling}
          disabled={isCancelling}
        >
          {t('Cancel')}
        </Button>
      </StyledRow>
      {isDefined(historyImport.resumeAt) ? (
        <Text size="sm" color="tertiary">
          {t(
            'WhatsApp limits how fast conversations can be imported. The import resumes {resumeAt}.',
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
          <Text size="sm" color="tertiary">
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
