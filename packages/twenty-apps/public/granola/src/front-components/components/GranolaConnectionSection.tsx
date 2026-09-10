import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useId, useState } from 'react';
import { t } from 'twenty-sdk/front-component';
import { Status } from 'twenty-ui/data-display';
import { IconKey } from 'twenty-ui/icon';
import { Button, LightButton } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';

import { LabelledSettingsField } from 'src/front-components/components/LabelledSettingsField';
import { SettingsOptionCardContent } from 'src/front-components/components/SettingsOptionCardContent';
import { StyledSettingsCard } from 'src/front-components/components/StyledSettingsCard';
import { StyledSettingsSectionStack } from 'src/front-components/components/StyledSettingsSectionStack';
import { StyledSettingsTextInput } from 'src/front-components/components/StyledSettingsTextInput';
import { type GranolaConnectionStatus } from 'src/front-components/types/granola-connection-status.type';

const StyledKeyForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[3]};
`;

const StyledButtonRow = styled.div`
  display: flex;
  gap: ${() => themeCssVariables.spacing[2]};
`;

type GranolaConnectionSectionProps = {
  status: GranolaConnectionStatus;
  isConnecting: boolean;
  connectError: string | undefined;
  onConnect: (apiKey: string) => Promise<boolean>;
  onRetry: () => void;
};

const getConnectionDescription = (status: GranolaConnectionStatus) =>
  status.isConnected
    ? t('Connected to Granola.')
    : (status.error ?? t('Granola rejected the saved key.'));

export const GranolaConnectionSection = ({
  status,
  isConnecting,
  connectError,
  onConnect,
  onRetry,
}: GranolaConnectionSectionProps) => {
  const inputId = useId();
  const [apiKeyDraft, setApiKeyDraft] = useState('');
  const [isReplacingKey, setIsReplacingKey] = useState(false);

  const trimmedApiKeyDraft = apiKeyDraft.trim();
  const isKeyRejected =
    status.isApiKeySet && !status.isConnected && status.isGranolaReachable;
  const isKeyFormVisible =
    !status.isApiKeySet || isKeyRejected || isReplacingKey;
  const isCancelVisible = status.isConnected && isReplacingKey;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isNonEmptyString(trimmedApiKeyDraft)) {
      return;
    }

    const isSaved = await onConnect(trimmedApiKeyDraft);

    if (isSaved) {
      setApiKeyDraft('');
      setIsReplacingKey(false);
    }
  };

  return (
    <Section>
      <H2Title
        title={t('Granola account')}
        description={t(
          'Requires Granola Business or Enterprise. Create a key in Granola under Settings → Connectors → API keys.',
        )}
      />
      <StyledSettingsSectionStack>
        {status.isApiKeySet && (
          <StyledSettingsCard>
            <SettingsOptionCardContent
              Icon={IconKey}
              title={t('API key')}
              description={getConnectionDescription(status)}
            >
              {status.isConnected && (
                <Status color="green" text={t('Connected')} />
              )}
              {isKeyRejected && <Status color="red" text={t('Rejected')} />}
              {!status.isGranolaReachable && (
                <>
                  <Status color="orange" text={t('Unreachable')} />
                  <LightButton title={t('Retry')} onClick={onRetry} />
                </>
              )}
              {status.isConnected && !isReplacingKey && (
                <LightButton
                  title={t('Replace')}
                  onClick={() => setIsReplacingKey(true)}
                />
              )}
            </SettingsOptionCardContent>
          </StyledSettingsCard>
        )}
        {isKeyFormVisible && (
          <StyledKeyForm onSubmit={handleSubmit}>
            <LabelledSettingsField
              label={status.isApiKeySet ? t('New API key') : t('API key')}
              inputId={inputId}
              errorMessage={connectError}
              hint={t(
                'Workspace keys sync notes shared with the whole workspace. Personal keys also sync your own notes.',
              )}
            >
              <StyledSettingsTextInput
                id={inputId}
                type="password"
                autoComplete="off"
                placeholder="grn_…"
                value={apiKeyDraft}
                disabled={isConnecting}
                onChange={(event) => setApiKeyDraft(event.target.value)}
              />
            </LabelledSettingsField>
            <StyledButtonRow>
              <Button
                type="submit"
                title={t('Connect')}
                accent="blue"
                isLoading={isConnecting}
                disabled={isConnecting || !isNonEmptyString(trimmedApiKeyDraft)}
              />
              {isCancelVisible && (
                <Button
                  title={t('Cancel')}
                  variant="secondary"
                  disabled={isConnecting}
                  onClick={() => {
                    setIsReplacingKey(false);
                    setApiKeyDraft('');
                  }}
                />
              )}
            </StyledButtonRow>
          </StyledKeyForm>
        )}
      </StyledSettingsSectionStack>
    </Section>
  );
};
