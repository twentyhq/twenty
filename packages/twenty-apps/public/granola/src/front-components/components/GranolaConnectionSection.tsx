import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useId, useState } from 'react';
import { t } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { Status } from 'twenty-ui/data-display';
import { Loader } from 'twenty-ui/feedback';
import { IconKey, IconTrash } from 'twenty-ui/icon';
import { Button, IconButton, LightButton } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';

import { LabelledSettingsField } from 'src/front-components/components/LabelledSettingsField';
import { SettingsOptionCardContent } from 'src/front-components/components/SettingsOptionCardContent';
import { StyledSettingsCard } from 'src/front-components/components/StyledSettingsCard';
import { StyledSettingsError } from 'src/front-components/components/StyledSettingsError';
import { StyledSettingsSectionStack } from 'src/front-components/components/StyledSettingsSectionStack';
import { StyledSettingsTextInput } from 'src/front-components/components/StyledSettingsTextInput';
import { type GranolaConnectionStatus } from 'src/front-components/types/granola-connection-status.type';
import { isGranolaConnectionReady } from 'src/front-components/utils/is-granola-connection-ready.util';

const StyledKeyForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[3]};
`;

const StyledActions = styled.div`
  display: flex;
  gap: ${() => themeCssVariables.spacing[2]};
  justify-content: flex-start;
`;

const StyledConnectButtonContainer = styled.div`
  button {
    gap: ${() => themeCssVariables.spacing[2]};
    min-width: ${() => themeCssVariables.spacing[32]};
    padding-inline: ${() => themeCssVariables.spacing[4]};
  }
`;

const StyledConnectionHint = styled.div`
  color: ${() => themeCssVariables.font.color.secondary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
`;

// Button's isLoading animation clips the title; keep the loader in its icon slot.
const ConnectionLoader = () => <Loader />;

type GranolaConnectionSectionProps = {
  status: GranolaConnectionStatus;
  isConnecting: boolean;
  isRemoving: boolean;
  connectError: string | undefined;
  removeError: string | undefined;
  onConnect: (apiKey: string) => Promise<boolean>;
  onRemove: () => Promise<void>;
  onRetry: () => void;
};

export const GranolaConnectionSection = ({
  status,
  isConnecting,
  isRemoving,
  connectError,
  removeError,
  onConnect,
  onRemove,
  onRetry,
}: GranolaConnectionSectionProps) => {
  const inputId = useId();
  const [apiKeyDraft, setApiKeyDraft] = useState('');

  const trimmedApiKeyDraft = apiKeyDraft.trim();
  const isConnected =
    !isConnecting &&
    isGranolaConnectionReady(status) &&
    !isDefined(connectError);
  const connectionError = isConnecting
    ? undefined
    : (connectError ??
      (status.isApiKeySet && !isConnected
        ? t('Could not connect to Granola. Try again.')
        : undefined));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isConnecting || isRemoving) {
      return;
    }

    if (status.isApiKeySet) {
      onRetry();

      return;
    }

    if (!isNonEmptyString(trimmedApiKeyDraft)) {
      return;
    }

    const isSaved = await onConnect(trimmedApiKeyDraft);

    if (isSaved) {
      setApiKeyDraft('');
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
        {isConnected && (
          <StyledSettingsCard>
            <SettingsOptionCardContent
              Icon={IconKey}
              title={t('API key')}
              description={t(
                'New and updated notes appear in Call Recordings automatically.',
              )}
            >
              <Status color="green" text={t('Connected')} />
              <IconButton
                Icon={IconTrash}
                variant="tertiary"
                accent="danger"
                ariaLabel={
                  isRemoving ? t('Removing API key') : t('Remove API key')
                }
                disabled={isRemoving}
                onClick={() => onRemove()}
              />
            </SettingsOptionCardContent>
          </StyledSettingsCard>
        )}
        {isDefined(removeError) && (
          <StyledSettingsError>{removeError}</StyledSettingsError>
        )}
        {!isConnected && (
          <StyledKeyForm onSubmit={handleSubmit}>
            <LabelledSettingsField
              label={t('API key')}
              inputId={inputId}
              errorMessage={connectionError}
            >
              <StyledSettingsTextInput
                id={inputId}
                type="password"
                autoComplete="off"
                placeholder={status.isApiKeySet ? '••••••••' : 'grn_…'}
                value={apiKeyDraft}
                disabled={isConnecting || isRemoving || status.isApiKeySet}
                onChange={(event) => setApiKeyDraft(event.target.value)}
              />
            </LabelledSettingsField>
            <StyledActions>
              {status.isApiKeySet && isDefined(connectionError) && (
                <LightButton
                  title={t('Cancel')}
                  disabled={isRemoving}
                  onClick={() => onRemove()}
                />
              )}
              <StyledConnectButtonContainer>
                <Button
                  type="submit"
                  title={isConnecting ? t('Connecting') : t('Connect')}
                  accent="blue"
                  justify="center"
                  Icon={isConnecting ? ConnectionLoader : undefined}
                  disabled={
                    isConnecting ||
                    isRemoving ||
                    (!status.isApiKeySet &&
                      !isNonEmptyString(trimmedApiKeyDraft))
                  }
                />
              </StyledConnectButtonContainer>
            </StyledActions>
            {isConnecting && (
              <StyledConnectionHint role="status">
                {t('Configuring your connection. This may take a few seconds.')}
              </StyledConnectionHint>
            )}
          </StyledKeyForm>
        )}
      </StyledSettingsSectionStack>
    </Section>
  );
};
