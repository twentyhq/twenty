import styled from '@emotion/styled';
import { t } from 'twenty-sdk/front-component';
import { getPublicAssetUrl, isDefined } from 'twenty-sdk/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { Field, Input, InputGroup } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { WhatsappHistoryImportStatus } from 'src/front-components/components/WhatsappHistoryImportStatus';
import { getWhatsappHistoryImportErrorReason } from 'src/front-components/utils/get-whatsapp-history-import-error-reason.util';
import { type WhatsappHistoryImportState } from 'src/types/whatsapp-history-import-state.type';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[2]};
`;

type WhatsappAccountFieldProps = {
  name: string;
  handle: string;
  isAuthFailed: boolean;
  historyImport: WhatsappHistoryImportState | null;
  importProgress: number | undefined;
  isImportRetrying: boolean;
  onRetryImport: () => void;
};

export const WhatsappAccountField = ({
  name,
  handle,
  isAuthFailed,
  historyImport,
  importProgress,
  isImportRetrying,
  onRetryImport,
}: WhatsappAccountFieldProps) => (
  <StyledContainer>
    <Field.Root>
      <Field.Label>{t('Account')}</Field.Label>
      <InputGroup
        startElement={
          <Avatar
            src={getPublicAssetUrl('whatsapp-logomark.svg')}
            name="WhatsApp"
            size="sm"
            shape="rounded-square"
          />
        }
        endElement={
          <WhatsappHistoryImportStatus
            historyImport={historyImport}
            progress={importProgress}
          />
        }
      >
        <Input readOnly value={`${name} · ${handle}`} />
      </InputGroup>
    </Field.Root>
    {isAuthFailed && (
      <InlineBanner layout="compact" status="warning" fullWidth>
        {t(
          'This connection was unlinked from your phone. Reconnect your account to keep syncing.',
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
        {getWhatsappHistoryImportErrorReason(historyImport.error)}
      </InlineBanner>
    )}
    {historyImport?.status === 'IMPORTING' &&
      isDefined(historyImport.resumeAt) && (
        <Text size="sm" color="tertiary" aria-live="polite">
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
      )}
  </StyledContainer>
);
