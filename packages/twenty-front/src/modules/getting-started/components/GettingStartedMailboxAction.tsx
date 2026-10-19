import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import {
  MessageChannelVisibility,
  CalendarChannelVisibility,
} from '~/generated-metadata/graphql';
import { useLingui } from '@lingui/react/macro';
import {
  ConnectedAccountProvider,
  AppPath,
  SettingsPath,
} from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  IconGoogle,
  IconMicrosoft,
  IconLock,
  IconDotsVertical,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import {
  StyledGettingStartedColumn,
  StyledGettingStartedRow,
  StyledGettingStartedMuted,
} from '@/getting-started/components/GettingStartedStyles';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import { useToast } from 'twenty-ui/components/feedback';

export const GettingStartedMailboxAction = () => {
  const { t } = useLingui();
  const { triggerApisOAuth } = useTriggerApisOAuth();
  const { accounts } = useMyConnectedAccounts();
  const activeAccounts = accounts.filter((account) => !account.archivedAt);
  const { totalCount: peopleCount } = useFindManyRecords({
    objectNameSingular: 'person',
    limit: 1,
    recordGqlFields: { id: true },
    skip: activeAccounts.length === 0,
  });
  const { totalCount: companyCount } = useFindManyRecords({
    objectNameSingular: 'company',
    limit: 1,
    recordGqlFields: { id: true },
    skip: activeAccounts.length === 0,
  });
  const isGoogleMessagingEnabled = useAtomStateValue(
    isGoogleMessagingEnabledState,
  );
  const isMicrosoftMessagingEnabled = useAtomStateValue(
    isMicrosoftMessagingEnabledState,
  );
  const { enqueueToast } = useToast();
  const connect = async (provider: ConnectedAccountProvider) => {
    try {
      await triggerApisOAuth(provider, {
        redirectLocation: AppPath.GettingStarted,
        messageVisibility: MessageChannelVisibility.METADATA,
        calendarVisibility: CalendarChannelVisibility.METADATA,
      });
    } catch {
      enqueueToast({
        status: 'error',
        children: t`Could not connect your mailbox. Please try again.`,
      });
    }
  };
  return (
    <StyledGettingStartedColumn>
      <StyledGettingStartedRow>
        <IconLock size={12} />
        <StyledGettingStartedMuted>{t`Teammates see who you talk to, not what you write.`}</StyledGettingStartedMuted>
      </StyledGettingStartedRow>
      <StyledGettingStartedRow>
        <Button
          size="sm"
          disabled={!isGoogleMessagingEnabled}
          startIcon={<IconGoogle size={14} />}
          onClick={() => void connect(ConnectedAccountProvider.GOOGLE)}
        >{t`Continue with Google`}</Button>
        <Button
          size="sm"
          disabled={!isMicrosoftMessagingEnabled}
          startIcon={<IconMicrosoft size={14} />}
          onClick={() => void connect(ConnectedAccountProvider.MICROSOFT)}
        >{t`Continue with Microsoft`}</Button>
      </StyledGettingStartedRow>
      {activeAccounts.map((account) => (
        <StyledGettingStartedRow key={account.id}>
          {account.provider === ConnectedAccountProvider.GOOGLE ? (
            <IconGoogle size={14} />
          ) : (
            <IconMicrosoft size={14} />
          )}
          <span>{account.handle}</span>
          <StyledGettingStartedMuted>
            {account.authFailedAt
              ? t`Reconnect required`
              : account.messageChannels.some(
                    (channel) => channel.syncStatus === 'ONGOING',
                  )
                ? t`Syncing`
                : account.messageChannels.some(
                      (channel) => channel.syncStatus === 'ACTIVE',
                    )
                  ? t`Synced`
                  : t`Connected`}
          </StyledGettingStartedMuted>
          <Button
            size="sm"
            variant="ghost"
            href={getSettingsPath(SettingsPath.Accounts)}
            aria-label={t`Manage account`}
          >
            <IconDotsVertical size={14} />
          </Button>
        </StyledGettingStartedRow>
      ))}
      {activeAccounts.length > 0 &&
        isDefined(peopleCount) &&
        isDefined(companyCount) && (
          <StyledGettingStartedMuted>{t`${peopleCount} people and ${companyCount} companies in your workspace`}</StyledGettingStartedMuted>
        )}
      {activeAccounts.length > 0 && (
        <Button size="sm" href="/objects/people">{t`Open people`}</Button>
      )}
    </StyledGettingStartedColumn>
  );
};
