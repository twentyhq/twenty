import { t } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { Status } from 'twenty-ui/data-display';
import { IconWebhook } from 'twenty-ui/icon';
import { LightButton } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/typography';

import { SettingsOptionCardContent } from 'src/front-components/components/SettingsOptionCardContent';
import { StyledSettingsCard } from 'src/front-components/components/StyledSettingsCard';
import { StyledSettingsError } from 'src/front-components/components/StyledSettingsError';
import { StyledSettingsSectionStack } from 'src/front-components/components/StyledSettingsSectionStack';
import { type GranolaConnectionStatus } from 'src/front-components/types/granola-connection-status.type';
import { getGranolaLiveSyncState } from 'src/front-components/utils/get-granola-live-sync-state.util';

type GranolaLiveSyncSectionProps = {
  status: GranolaConnectionStatus;
  isRegistering: boolean;
  registrationError: string | undefined;
  onRegister: () => Promise<void>;
};

export const GranolaLiveSyncSection = ({
  status,
  isRegistering,
  registrationError,
  onRegister,
}: GranolaLiveSyncSectionProps) => {
  const displayState = isRegistering
    ? 'registering'
    : getGranolaLiveSyncState(status);

  const description = {
    registering: t('Registering the Granola webhook…'),
    active: t(
      'New and updated notes appear in Call Recordings within minutes.',
    ),
    paused: t(
      'The webhook is paused in Granola. Resume it to receive new notes again.',
    ),
    unregistered: t(
      'Granola sends a signed webhook to Twenty whenever a note is created or edited.',
    ),
  }[displayState];

  return (
    <Section>
      <H2Title
        title={t('Live sync')}
        description={t('Keeps Call Recordings up to date as notes change.')}
      />
      <StyledSettingsSectionStack>
        <StyledSettingsCard>
          <SettingsOptionCardContent
            Icon={IconWebhook}
            title={t('Webhook')}
            description={description}
          >
            {displayState === 'registering' && (
              <Status color="gray" text={t('Setting up')} isLoaderVisible />
            )}
            {displayState === 'active' && (
              <Status color="green" text={t('Active')} />
            )}
            {displayState === 'paused' && (
              <>
                <Status color="orange" text={t('Paused')} />
                <LightButton title={t('Resume')} onClick={() => onRegister()} />
              </>
            )}
            {displayState === 'unregistered' && (
              <>
                <Status color="red" text={t('Not set up')} />
                <LightButton title={t('Set up')} onClick={() => onRegister()} />
              </>
            )}
          </SettingsOptionCardContent>
        </StyledSettingsCard>
        {isDefined(registrationError) && (
          <StyledSettingsError>{registrationError}</StyledSettingsError>
        )}
      </StyledSettingsSectionStack>
    </Section>
  );
};
