import styled from '@emotion/styled';
import { useId } from 'react';
import { t } from 'twenty-sdk/front-component';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { themeCssVariables } from 'twenty-ui/theme';
import { getPublicAssetUrl, isDefined } from 'twenty-sdk/utils';

import { LinkedinHistoryImportStatus } from 'src/front-components/components/LinkedinHistoryImportStatus';
import { getLinkedinHistoryImportErrorReason } from 'src/front-components/utils/get-linkedin-history-import-error-reason.util';
import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

const StyledContainer = styled.div`
  border-bottom: 1px solid ${() => themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[1]};
  padding-bottom: ${() => themeCssVariables.spacing[6]};
`;

const StyledLabel = styled.span`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-size: ${() => themeCssVariables.font.size.xs};
  font-weight: ${() => themeCssVariables.font.weight.semiBold};
`;

const StyledValue = styled.div`
  align-items: center;
  background-color: ${() => themeCssVariables.background.transparent.lighter};
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.sm};
  color: ${() => themeCssVariables.font.color.primary};
  display: flex;
  gap: ${() => themeCssVariables.spacing[2]};
  height: ${() => themeCssVariables.spacing[8]};
  min-width: 0;
  padding: 0 ${() => themeCssVariables.spacing[2]};
`;

const StyledLogo = styled.img`
  flex-shrink: 0;
  height: ${() => themeCssVariables.spacing[4]};
  width: ${() => themeCssVariables.spacing[4]};
`;

const StyledText = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledHandle = styled.span`
  color: ${() => themeCssVariables.font.color.tertiary};
`;

const StyledStatus = styled.span`
  display: flex;
  flex-shrink: 0;
`;

const StyledCaption = styled.p`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-size: ${() => themeCssVariables.font.size.sm};
  margin: 0;
`;

type LinkedinAccountFieldProps = {
  name: string;
  handle: string;
  isAuthFailed: boolean;
  historyImport: LinkedinHistoryImportState | null;
  importProgress: number | undefined;
  isImportRetrying: boolean;
  onRetryImport: () => void;
};

export const LinkedinAccountField = ({
  name,
  handle,
  isAuthFailed,
  historyImport,
  importProgress,
  isImportRetrying,
  onRetryImport,
}: LinkedinAccountFieldProps) => {
  const labelId = useId();

  return (
    <StyledContainer>
      <StyledLabel id={labelId}>{t('Account')}</StyledLabel>
      <StyledValue aria-labelledby={labelId}>
        <StyledLogo src={getPublicAssetUrl('linkedin-logomark.svg')} alt="" />
        <StyledText>
          {name} <StyledHandle>· {handle}</StyledHandle>
        </StyledText>
        <StyledStatus>
          <LinkedinHistoryImportStatus
            historyImport={historyImport}
            progress={importProgress}
          />
        </StyledStatus>
      </StyledValue>
      {isAuthFailed && (
        <InlineBanner layout="compact" status="warning">
          {t(
            'LinkedIn signed you out. Reconnect your account to keep syncing.',
          )}
        </InlineBanner>
      )}
      {historyImport?.status === 'FAILED' && (
        <InlineBanner
          layout="compact"
          status="error"
          role="alert"
          fullWidth
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
      {historyImport?.status === 'IMPORTING' &&
        isDefined(historyImport.resumeAt) && (
          <StyledCaption aria-live="polite">
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
        )}
    </StyledContainer>
  );
};
