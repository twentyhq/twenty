import { useMutation, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';

import { useSnackBarOnQueryError } from '@/apollo/hooks/useSnackBarOnQueryError';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { SettingsDeviceSessionRowDropdownMenu } from '@/settings/profile/devices/components/SettingsDeviceSessionRowDropdownMenu';
import { parseUserAgentDescription } from '@/settings/profile/devices/utils/parseUserAgentDescription';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { Status } from 'twenty-ui/data-display';
import { IconDeviceDesktop, IconLogout } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';
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
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();

  const { data, loading, error, refetch } = useQuery(
    CurrentUserSessionsDocument,
    { fetchPolicy: 'network-only' },
  );

  useSnackBarOnQueryError(error);

  const [revokeAllOtherUserSessions] = useMutation(
    RevokeAllOtherUserSessionsDocument,
  );

  const sessions = data?.currentUserSessions ?? [];
  // Without it, "log out all other devices" would revoke this browser too.
  const hasCurrentSession = sessions.some((session) => session.isCurrent);
  const hasOtherSessions =
    hasCurrentSession && sessions.some((session) => !session.isCurrent);

  if (!loading && sessions.length === 0) {
    return null;
  }

  const handleRevokeAllOtherSessions = async () => {
    try {
      await revokeAllOtherUserSessions();
      enqueueSuccessSnackBar({ message: t`Logged out all other devices` });
      await refetch();
    } catch {
      enqueueErrorSnackBar({ message: t`Failed to log out other devices` });
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
          RowRightComponent={({ item: session }) => (
            <>
              {session.isImpersonating && (
                <Status color="orange" text={t`Impersonation`} />
              )}
              {session.isCurrent ? (
                <Status color="turquoise" text={t`This device`} />
              ) : (
                <SettingsDeviceSessionRowDropdownMenu
                  userSessionId={session.id}
                  onRevoked={() => void refetch()}
                />
              )}
            </>
          )}
        />
        {hasOtherSessions && (
          <StyledButtonContainer>
            <Button
              Icon={IconLogout}
              title={t`Log out all other devices`}
              size="small"
              onClick={() => void handleRevokeAllOtherSessions()}
            />
          </StyledButtonContainer>
        )}
      </StyledContainer>
    </Section>
  );
};
