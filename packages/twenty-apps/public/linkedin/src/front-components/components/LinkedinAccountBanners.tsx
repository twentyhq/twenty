import styled from '@emotion/styled';
import { t } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

import { getLinkedinHistoryImportErrorReason } from 'src/front-components/utils/get-linkedin-history-import-error-reason.util';
import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

const StyledBanners = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[2]};
`;

type LinkedinAccountBannersProps = {
  isAuthFailed: boolean;
  historyImport: LinkedinHistoryImportState | null;
  isImportRetrying: boolean;
  onRetryImport: () => void;
};

export const LinkedinAccountBanners = ({
  isAuthFailed,
  historyImport,
  isImportRetrying,
  onRetryImport,
}: LinkedinAccountBannersProps) => {
  const hasImportFailed = historyImport?.status === 'FAILED';
  const importResumeAt =
    historyImport?.status === 'IMPORTING' ? historyImport.resumeAt : undefined;

  if (!isAuthFailed && !hasImportFailed && !isDefined(importResumeAt)) {
    return null;
  }

  return (
    <StyledBanners>
      {isAuthFailed && (
        <InlineBanner status="warning" fullWidth embedded>
          {t(
            'LinkedIn signed you out. Reconnect your account to keep syncing.',
          )}
        </InlineBanner>
      )}
      {hasImportFailed && (
        <InlineBanner
          status="error"
          role="alert"
          fullWidth
          embedded
          action={
            <InlineBanner.Action
              onClick={onRetryImport}
              disabled={isImportRetrying}
            >
              {t('Retry')}
            </InlineBanner.Action>
          }
        >
          {t('The import stopped before finishing.')}{' '}
          {getLinkedinHistoryImportErrorReason(historyImport.error)}
        </InlineBanner>
      )}
      {isDefined(importResumeAt) && (
        <InlineBanner status="info" fullWidth embedded>
          {t(
            'LinkedIn limits how much can be imported each day. The import resumes {resumeAt}.',
            {
              resumeAt: new Date(importResumeAt).toLocaleString(undefined, {
                weekday: 'short',
                hour: 'numeric',
                minute: '2-digit',
              }),
            },
          )}
        </InlineBanner>
      )}
    </StyledBanners>
  );
};
