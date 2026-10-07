import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import {
  ConnectedAccountProvider,
  MessageChannelType,
} from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';
import {
  IconCalendarEvent,
  IconGmail,
  IconGoogleCalendar,
  IconMail,
  IconMicrosoftOutlook,
} from 'twenty-ui/icon';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

const StyledUsage = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledIcon = styled.span`
  display: flex;
`;

type SettingsAccountsAccountUsageProps = {
  account: ConnectedAccount;
};

export const SettingsAccountsAccountUsage = ({
  account,
}: SettingsAccountsAccountUsageProps) => {
  const theme = useTheme();
  const { t } = useLingui();
  const hasEmailChannel = account.messageChannels.some(
    (channel) => channel.type === MessageChannelType.EMAIL,
  );
  const hasCalendarChannel = isNonEmptyArray(account.calendarChannels);

  return (
    <StyledUsage>
      {account.provider === ConnectedAccountProvider.GOOGLE && (
        <>
          {hasEmailChannel && (
            <StyledIcon role="img" aria-label={t`Gmail`} title={t`Gmail`}>
              <IconGmail size={theme.icon.size.md} />
            </StyledIcon>
          )}
          {hasCalendarChannel && (
            <StyledIcon
              role="img"
              aria-label={t`Google Calendar`}
              title={t`Google Calendar`}
            >
              <IconGoogleCalendar size={theme.icon.size.md} />
            </StyledIcon>
          )}
        </>
      )}
      {account.provider === ConnectedAccountProvider.MICROSOFT &&
        (hasEmailChannel || hasCalendarChannel) && (
          <StyledIcon role="img" aria-label={t`Outlook`} title={t`Outlook`}>
            <IconMicrosoftOutlook size={theme.icon.size.md} />
          </StyledIcon>
        )}
      {account.provider === ConnectedAccountProvider.IMAP_SMTP_CALDAV && (
        <>
          {hasEmailChannel && (
            <StyledIcon role="img" aria-label={t`Email`} title={t`Email`}>
              <IconMail size={theme.icon.size.md} />
            </StyledIcon>
          )}
          {hasCalendarChannel && (
            <StyledIcon role="img" aria-label={t`Calendar`} title={t`Calendar`}>
              <IconCalendarEvent size={theme.icon.size.md} />
            </StyledIcon>
          )}
        </>
      )}
    </StyledUsage>
  );
};
