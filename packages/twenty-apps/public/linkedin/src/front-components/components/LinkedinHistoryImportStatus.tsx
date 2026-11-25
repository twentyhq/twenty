import styled from '@emotion/styled';
import { t } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { IconRefresh } from 'twenty-ui/icon';
import { Loader } from 'twenty-ui/primitives/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { AnimatedCount } from 'src/front-components/components/AnimatedCount';
import { formatLinkedinSyncProgressLabel } from 'src/front-components/utils/format-linkedin-sync-progress-label.util';
import { getLinkedinHistoryImportErrorReason } from 'src/front-components/utils/get-linkedin-history-import-error-reason.util';
import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

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

const StyledProgress = styled.p`
  align-items: center;
  color: ${() => themeCssVariables.font.color.secondary};
  display: flex;
  flex: 1;
  gap: ${() => themeCssVariables.spacing[2]};
  margin: 0;
  min-width: 0;
`;

const StyledCaption = styled.p`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-size: ${() => themeCssVariables.font.size.sm};
  margin: 0;
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

type LinkedinHistoryImportStatusProps = {
  historyImport: LinkedinHistoryImportState;
  progress: number | undefined;
  isRetrying: boolean;
  isCancelling: boolean;
  onRetry: () => void;
  onCancel: () => void;
};

export const LinkedinHistoryImportStatus = ({
  historyImport,
  progress,
  isRetrying,
  isCancelling,
  onRetry,
  onCancel,
}: LinkedinHistoryImportStatusProps) => {
  if (historyImport.status === 'FAILED') {
    return (
      <StyledRow>
        <StyledError role="alert">
          <StyledErrorTitle>
            {t('The import stopped before finishing.')}
          </StyledErrorTitle>{' '}
          {getLinkedinHistoryImportErrorReason(historyImport.error)}
        </StyledError>
        <Button
          startIcon={<IconRefresh />}
          variant="outline"
          size="md"
          onClick={onRetry}
          loading={isRetrying}
          disabled={isRetrying}
        >
          {t('Retry')}
        </Button>
      </StyledRow>
    );
  }

  const isListing =
    !isDefined(historyImport.chunkCount) &&
    !isDefined(historyImport.totalConversationCount);

  return (
    <StyledContainer aria-live="polite">
      <StyledRow>
        <StyledProgress>
          <Loader />
          {isDefined(progress)
            ? t('Importing past conversations {progress}', {
                progress: formatLinkedinSyncProgressLabel(progress),
              })
            : t('Importing past conversations…')}
        </StyledProgress>
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
        <StyledCaption>
          {t(
            'LinkedIn limits how much can be imported each day. The import resumes {resumeAt}.',
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
          <StyledCaption>
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
