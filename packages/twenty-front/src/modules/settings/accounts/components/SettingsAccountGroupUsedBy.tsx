import { AppChip } from '@/applications/components/AppChip';
import { getApplicationDisplayName } from '@/applications/utils/getApplicationDisplayName';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { type ConnectedAccountGroup } from '@/settings/accounts/types/ConnectedAccountGroup';
import { getConnectedAccountSettingsChannels } from '@/settings/accounts/utils/getConnectedAccountSettingsChannels';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  IconCalendarEvent,
  IconGmail,
  IconGoogleCalendar,
  IconMail,
  IconMicrosoftOutlook,
} from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledUsedBy = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledUsage = styled.span`
  display: flex;
`;

type Usage = {
  key: string;
  title: string;
  icon: ReactNode;
};

type SettingsAccountGroupUsedByProps = {
  group: ConnectedAccountGroup;
};

export const SettingsAccountGroupUsedBy = ({
  group,
}: SettingsAccountGroupUsedByProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const iconSize = theme.icon.size.md;

  const { messageChannel, calendarChannel } =
    getConnectedAccountSettingsChannels(group.nativeAccount);
  const usesEmails = isDefined(messageChannel);
  const usesCalendar = isDefined(calendarChannel);

  const getNativeUsages = (): (Usage | undefined)[] => {
    switch (group.nativeAccount?.provider) {
      case ConnectedAccountProvider.GOOGLE:
        return [
          usesEmails
            ? {
                key: 'gmail',
                title: t`Gmail`,
                icon: <IconGmail size={iconSize} />,
              }
            : undefined,
          usesCalendar
            ? {
                key: 'google-calendar',
                title: t`Google Calendar`,
                icon: <IconGoogleCalendar size={iconSize} />,
              }
            : undefined,
        ];
      case ConnectedAccountProvider.MICROSOFT:
        return [
          usesEmails || usesCalendar
            ? {
                key: 'outlook',
                title: t`Outlook`,
                icon: <IconMicrosoftOutlook size={iconSize} />,
              }
            : undefined,
        ];
      case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
        return [
          usesEmails
            ? {
                key: 'emails',
                title: t`Emails`,
                icon: <IconMail size={iconSize} />,
              }
            : undefined,
          usesCalendar
            ? {
                key: 'calendar',
                title: t`Calendar`,
                icon: <IconCalendarEvent size={iconSize} />,
              }
            : undefined,
        ];
      default:
        return [];
    }
  };

  const applicationIds = new Set(
    group.appAccounts.map((account) => account.applicationId).filter(isDefined),
  );

  const appUsages = [...applicationIds].map((applicationId): Usage => {
    const application = currentWorkspace?.installedApplications.find(
      (installedApplication) => installedApplication.id === applicationId,
    );

    return {
      key: applicationId,
      title: isDefined(application)
        ? getApplicationDisplayName({ application, currentWorkspace })
        : t`Application`,
      icon: <AppChip applicationId={applicationId} chipOnly />,
    };
  });

  return (
    <StyledUsedBy>
      {[...getNativeUsages().filter(isDefined), ...appUsages].map(
        ({ key, title, icon }) => (
          <Tooltip key={key} content={title}>
            <StyledUsage role="img" aria-label={title}>
              {icon}
            </StyledUsage>
          </Tooltip>
        ),
      )}
    </StyledUsedBy>
  );
};
