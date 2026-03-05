import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  IconAt,
  IconCalendarEvent,
  type IconComponent,
  type IconComponentProps,
  IconGoogle,
  IconMail,
  IconMicrosoft,
  IconSend,
} from 'twenty-ui/display';
import {
  resolveThemeVariable,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

const ImapSmtpCaldavIcon = (
  props: IconComponentProps & { account: ConnectedAccount },
) => {
  const { account } = props;

  const hasImap = isDefined(account.connectionParameters?.IMAP);
  const hasSmtp = isDefined(account.connectionParameters?.SMTP);
  const hasCaldav = isDefined(account.connectionParameters?.CALDAV);

  let IconToShow: IconComponent;

  if (hasImap && hasSmtp && hasCaldav) {
    IconToShow = IconAt;
  } else if (hasImap && hasCaldav) {
    IconToShow = IconAt;
  } else if (hasImap && hasSmtp) {
    IconToShow = IconMail;
  } else if (hasImap) {
    IconToShow = IconMail;
  } else if (hasSmtp) {
    IconToShow = IconSend;
  } else if (hasCaldav) {
    IconToShow = IconCalendarEvent;
  } else {
    IconToShow = IconMail;
  }

  return (
    <IconToShow
      className={props.className}
      style={props.style}
      size={props.size}
      stroke={props.stroke}
      color={
        props.color ||
        resolveThemeVariable(themeCssVariables.font.color.primary)
      }
    />
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
