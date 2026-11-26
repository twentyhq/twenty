import styled from '@emotion/styled';
import { t } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

import { getWhatsappHistoryImportErrorReason } from 'src/front-components/utils/get-whatsapp-history-import-error-reason.util';
import { type WhatsappHistoryImportState } from 'src/types/whatsapp-history-import-state.type';

const StyledBanners = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[2]};
`;

type WhatsappAccountBannersProps = {
  isAuthFailed: boolean;
  historyImport: WhatsappHistoryImportState | null;
  isImportRetrying: boolean;
  onRetryImport: () => void;
};

export const WhatsappAccountBanners = ({
  isAuthFailed,
  historyImport,
  isImportRetrying,
  onRetryImport,
}: WhatsappAccountBannersProps) => {
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
            'This connection was unlinked from your phone. Reconnect your account to keep syncing.',
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
          {getWhatsappHistoryImportErrorReason(historyImport.error)}
        </InlineBanner>
      )}
      {isDefined(importResumeAt) && (
        <InlineBanner status="info" fullWidth embedded>
          {t(
            'WhatsApp limits how fast conversations can be imported. The import resumes {resumeAt}.',
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
