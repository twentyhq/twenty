import { AppChip } from '@/applications/components/AppChip';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { type ConnectedAccountGroupTab } from '@/settings/accounts/types/ConnectedAccountGroupTab';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import {
  IconAt,
  IconCalendarEvent,
  IconGmail,
  IconGoogleCalendar,
  IconMail,
  IconMicrosoftOutlook,
} from 'twenty-ui/icon';

export const useConnectedAccountGroupTabDisplay = () => {
  const { t } = useLingui();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const getTabDisplay = (tab: ConnectedAccountGroupTab) => {
    if (tab.type === 'connection') {
      return { title: t`Connection`, icon: <IconAt size={16} /> };
    }
    if (tab.type === 'app') {
      const title =
        currentWorkspace?.installedApplications.find(
          (application) => application.id === tab.applicationId,
        )?.name ?? t`Application`;

      return {
        title,
        icon: (
          <AppChip
            applicationId={tab.applicationId}
            fallbackApplicationData={{ name: title }}
            chipOnly
          />
        ),
      };
    }
    if (tab.type === 'calendar') {
      return tab.provider === ConnectedAccountProvider.GOOGLE
        ? { title: t`Google Calendar`, icon: <IconGoogleCalendar size={16} /> }
        : { title: t`Calendar`, icon: <IconCalendarEvent size={16} /> };
    }
    if (tab.provider === ConnectedAccountProvider.GOOGLE) {
      return { title: t`Gmail`, icon: <IconGmail size={16} /> };
    }
    if (tab.provider === ConnectedAccountProvider.MICROSOFT) {
      return { title: t`Outlook`, icon: <IconMicrosoftOutlook size={16} /> };
    }

    return {
      title:
        tab.provider === ConnectedAccountProvider.EMAIL_GROUP
          ? t`Email group`
          : t`Emails`,
      icon: <IconMail size={16} />,
    };
  };

  return { getTabDisplay };
};
