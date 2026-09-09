import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useId, useState } from 'react';
import { t } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { Status } from 'twenty-ui/data-display';
import { IconKey } from 'twenty-ui/icon';
import { Button, LightButton } from 'twenty-ui/input';
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
import { getGranolaKeyType } from 'src/front-components/utils/get-granola-key-type.util';

const StyledKeyForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[3]};
`;

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

const getConnectionDescription = (status: GranolaConnectionStatus) => {
  if (!status.isConnected) {
    return status.error ?? t('Granola rejected the saved key.');
  }

  if (!isDefined(status.registration)) {
    return t('Connected to Granola.');
  }

  return getGranolaKeyType(status.registration.scopes) === 'workspace'
    ? t('Workspace key. Syncs public workspace notes and shared spaces.')
    : t('Personal key. Syncs your notes and notes shared with you.');
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
  const isKeyRejected =
    status.isApiKeySet && !status.isConnected && status.isGranolaReachable;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
              <LightButton
                title={isRemoving ? t('Removing…') : t('Remove')}
                disabled={isRemoving}
                onClick={() => onRemove()}
              />
            </SettingsOptionCardContent>
          </StyledSettingsCard>
        )}
        {isDefined(removeError) && (
          <StyledSettingsError>{removeError}</StyledSettingsError>
        )}
        {!status.isApiKeySet && (
          <StyledKeyForm onSubmit={handleSubmit}>
            <LabelledSettingsField
              label={t('API key')}
              inputId={inputId}
              errorMessage={connectError}
              hint={t(
                'Workspace keys sync notes shared with the whole workspace. Personal keys also sync your own notes. The key type is detected automatically.',
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
            <Button
              type="submit"
              title={t('Connect')}
              accent="blue"
              isLoading={isConnecting}
              disabled={isConnecting || !isNonEmptyString(trimmedApiKeyDraft)}
            />
          </StyledKeyForm>
        )}
      </StyledSettingsSectionStack>
    </Section>
  );
};
