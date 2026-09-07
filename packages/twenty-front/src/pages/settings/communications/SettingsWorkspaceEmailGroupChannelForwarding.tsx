import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import { useEmailGroupForwardingSetup } from '@/settings/accounts/hooks/useEmailGroupForwardingSetup';
import { useMyMessageChannels } from '@/settings/accounts/hooks/useMyMessageChannels';
import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNonEmptyString } from '@sniptt/guards';
import {
  ConnectedAccountProvider,
  MessageChannelType,
  SettingsPath,
} from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconGoogle, IconMicrosoft } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { NotFound } from '~/pages/not-found/NotFound';

const FORWARDING_ERROR_QUERY_PARAM = 'forwardingError';

const StyledCardsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

export const SettingsWorkspaceEmailGroupChannelForwarding = () => {
  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();
  const { messageChannelId } = useParams<{ messageChannelId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigateSettings = useNavigateSettings();
  const { enqueueErrorSnackBar } = useSnackBar();

  const { channels, loading } = useMyMessageChannels();
  const { triggerApisOAuth } = useTriggerApisOAuth();
  const { dismissForwarding, isSubmitting } = useEmailGroupForwardingSetup();

  const isGoogleMessagingEnabled = useAtomStateValue(
    isGoogleMessagingEnabledState,
  );
  const isMicrosoftMessagingEnabled = useAtomStateValue(
    isMicrosoftMessagingEnabledState,
  );

  const forwardingError = searchParams.get(FORWARDING_ERROR_QUERY_PARAM);

  // The callback reports a provisioning failure through the URL; clearing it is what
  // keeps this to a single report.
  useEffect(() => {
    if (!isNonEmptyString(forwardingError)) {
      return;
    }

    setSearchParams({}, { replace: true });
    enqueueErrorSnackBar({ message: forwardingError });
  }, [enqueueErrorSnackBar, forwardingError, setSearchParams]);

  if (loading) {
    return <SettingsSkeletonLoader />;
  }

  const channel = channels.find(
    (channel) =>
      channel.id === messageChannelId &&
      channel.type === MessageChannelType.EMAIL_GROUP,
  );

  if (!isDefined(channel) || !isDefined(channel.connectedAccount)) {
    return <NotFound />;
  }

  const sourceAddress = channel.connectedAccount.handle;

  const handleSkip = async () => {
    await dismissForwarding(channel.id);
    navigateSettings(SettingsPath.EmailGroupChannelDetail, {
      messageChannelId: channel.id,
    });
  };

  const connectProvider = (provider: ConnectedAccountProvider) =>
    triggerApisOAuth(provider, {
      emailForwardingMessageChannelId: channel.id,
    });

  const providers = [
    {
      provider: ConnectedAccountProvider.GOOGLE,
      label: t`Connect with Google`,
      Icon: IconGoogle,
      isEnabled: isGoogleMessagingEnabled,
    },
    {
      provider: ConnectedAccountProvider.MICROSOFT,
      label: t`Connect with Microsoft`,
      Icon: IconMicrosoft,
      isEnabled: isMicrosoftMessagingEnabled,
    },
  ].filter(({ isEnabled }) => isEnabled);

  return (
    <SettingsPageLayout
      title={t`2. Forwarding`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        {
          children: t`Communication`,
          href: getSettingsPath(SettingsPath.WorkspaceCommunications),
        },
        { children: t`2. Forwarding` },
      ]}
      actionButton={
        <Button
          title={t`I'll do it manually`}
          variant="secondary"
          size="small"
          disabled={isSubmitting}
          onClick={handleSkip}
        />
      }
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Forward ${sourceAddress} to Twenty`}
            description={t`Mail only reaches Twenty once ${sourceAddress} forwards to ${channel.handle}. Twenty can set that up for you, or you can do it yourself later from the channel page.`}
          />
        </Section>
        <Section>
          <H2Title
            title={t`Set it up automatically`}
            description={t`Sign in as an administrator of your Google Workspace or Microsoft 365 tenant. Twenty creates the group, points it at your forwarding address, and forgets the authorisation immediately after.`}
          />
          <StyledCardsColumn>
            {providers.map(({ provider, label, Icon }) => (
              <SettingsCard
                key={provider}
                Icon={<Icon size={theme.icon.size.md} />}
                title={label}
                onClick={() => connectProvider(provider)}
              />
            ))}
          </StyledCardsColumn>
        </Section>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
