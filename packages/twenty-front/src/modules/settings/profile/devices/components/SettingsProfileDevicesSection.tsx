import { ToastOnQueryErrorEffect } from '@/apollo/components/ToastOnQueryErrorEffect';
import { useMutation, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';

import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { SettingsDeviceSessionRowRightComponent } from '@/settings/profile/devices/components/SettingsDeviceSessionRowRightComponent';
import { parseUserAgentDescription } from '@/settings/profile/devices/utils/parseUserAgentDescription';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useToast } from 'twenty-ui/primitives/feedback';
import { IconDeviceDesktop, IconLogout } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Section } from 'twenty-ui/primitives/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/primitives/typography';
import {
  CurrentUserSessionsDocument,
  type CurrentUserSessionsQuery,
  RevokeAllOtherUserSessionsDocument,
} from '~/generated-metadata/graphql';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

type UserSessionListItem =
  CurrentUserSessionsQuery['currentUserSessions'][number];

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

// A flex row so the button keeps its natural width while the card above it
// stretches to the section.
const StyledButtonContainer = styled.div`
  display: flex;
`;

export const SettingsProfileDevicesSection = () => {
  const { t } = useLingui();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);
  const { enqueueToast } = useToast();

  const { data, loading, error, refetch } = useQuery(
    CurrentUserSessionsDocument,
    { fetchPolicy: 'network-only' },
  );

  const [revokeAllOtherUserSessions] = useMutation(
    RevokeAllOtherUserSessionsDocument,
  );

  const sessions = data?.currentUserSessions ?? [];
  // Without it, "log out all other devices" would revoke this browser too.
  const hasCurrentSession = sessions.some((session) => session.isCurrent);
  const hasOtherSessions =
    hasCurrentSession && sessions.some((session) => !session.isCurrent);

  const handleRevokeAllOtherSessions = async () => {
    try {
      await revokeAllOtherUserSessions();
      enqueueToast({
        variant: 'success',
        children: t`Logged out all other devices`,
      });
      await refetch();
    } catch {
      enqueueToast({
        variant: 'error',
        children: t`Failed to log out other devices`,
      });
    }
  };

  const getSessionLabel = (session: UserSessionListItem) => {
    const { browser, operatingSystem } = parseUserAgentDescription(
      session.userAgent,
    );

    if (browser && operatingSystem) {
      return t`${browser} on ${operatingSystem}`;
    }

    return browser ?? operatingSystem ?? t`Unknown device`;
  };

  const getSessionDescription = (session: UserSessionListItem) => {
    const lastActive = beautifyPastDateRelativeToNow(
      session.lastActiveAt,
      localeCatalog,
    );

    return isNonEmptyString(session.ipAddress)
      ? t`Last active ${lastActive} · ${session.ipAddress}`
      : t`Last active ${lastActive}`;
  };

  return (
    <>
      <ToastOnQueryErrorEffect error={error} />
      {(loading || isNonEmptyArray(sessions)) && (
        <Section>
          <H2Title
            title={t`Devices`}
            description={t`Devices with an active session on your account`}
          />
          <StyledContainer>
            <SettingsListCard
              items={sessions}
              isLoading={loading}
              getItemLabel={getSessionLabel}
              getItemDescription={getSessionDescription}
              RowIcon={IconDeviceDesktop}
              RowRightComponent={SettingsDeviceSessionRowRightComponent}
            />
            {hasOtherSessions && (
              <StyledButtonContainer>
                <Button
                  startIcon={<IconLogout />}
                  size="sm"
                  onClick={() => void handleRevokeAllOtherSessions()}
                >
                  {t`Log out all other devices`}
                </Button>
              </StyledButtonContainer>
            )}
          </StyledContainer>
        </Section>
      )}
    </>
  );
};
