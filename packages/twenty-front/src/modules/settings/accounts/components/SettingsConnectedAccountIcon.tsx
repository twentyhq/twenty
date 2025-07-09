import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { ImapSmtpCaldavAccount } from '@/accounts/types/ImapSmtpCaldavAccount';
import { useTheme } from '@emotion/react';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  IconCalendarEvent,
  IconComponent,
  IconComponentProps,
  IconGoogle,
  IconMail,
  IconMicrosoft,
  IconSend,
} from 'twenty-ui/display';
import { Entries } from 'type-fest';

const SERVICES: Record<keyof ImapSmtpCaldavAccount, IconComponent> = {
  IMAP: IconMail,
  SMTP: IconSend,
  CALDAV: IconCalendarEvent,
} as const;

const ImapSmtpCaldavIcon = (
  props: IconComponentProps & { account: ConnectedAccount },
) => {
  const theme = useTheme();
  const connectionKeys = Object.entries(SERVICES) as Entries<typeof SERVICES>;

  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {connectionKeys.map(([connectionKey, IconComponent]) => (
        <IconComponent
          key={connectionKey}
          className={props.className}
          style={props.style}
          size={props.size}
          stroke={props.stroke}
          color={
            isDefined(props.account.connectionParameters?.[connectionKey])
              ? theme.font.color.primary
              : theme.font.color.tertiary
          }
        />
      ))}
    </div>
  );
};

const getIconForProvider = (account: ConnectedAccount): IconComponent => {
  switch (account.provider) {
    case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
      return (props) => (
        <ImapSmtpCaldavIcon
          account={account}
          className={props.className}
          style={props.style}
          size={props.size}
          stroke={props.stroke}
          color={props.color}
        />
      );
    case ConnectedAccountProvider.GOOGLE:
      return IconGoogle;
    case ConnectedAccountProvider.MICROSOFT:
      return IconMicrosoft;
    default:
      return IconMail;
  }
};

export const SettingsConnectedAccountIcon = ({
  account,
}: {
  account: ConnectedAccount;
}): IconComponent => {
  return getIconForProvider(account);
};
