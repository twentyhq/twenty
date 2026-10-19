import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsConnectedAccountIcon } from '@/settings/accounts/components/SettingsConnectedAccountIcon';
import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { SettingsConnectedAccountSyncStatus } from '@/settings/app-preferences/components/SettingsConnectedAccountSyncStatus';
import { NavigationButton } from '@/ui/input/components/NavigationButton';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import {
  AppPath,
  ConnectedAccountProvider,
  CoreObjectNameSingular,
  SettingsPath,
} from 'twenty-shared/types';
import { getAppPath, getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconGoogle, IconLock, IconMicrosoft } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import {
  CalendarChannelVisibility,
  MessageChannelVisibility,
} from '~/generated-metadata/graphql';

const StyledColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledMuted = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledAccountHandle = styled.span`
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const GettingStartedMailboxAction = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const { triggerApisOAuth } = useTriggerApisOAuth();
  const { accounts } = useMyConnectedAccounts();
  const activeAccounts = accounts.filter(
    (account) => !isDefined(account.archivedAt),
  );
  const hasActiveAccounts = activeAccounts.length > 0;
  const { objectMetadataItem: personObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.Person,
    });
  const { totalCount: peopleCount } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Person,
    limit: 1,
    recordGqlFields: { id: true },
    skip: !hasActiveAccounts,
  });
  const { totalCount: companyCount } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Company,
    limit: 1,
    recordGqlFields: { id: true },
    skip: !hasActiveAccounts,
  });
  const isGoogleMessagingEnabled = useAtomStateValue(
    isGoogleMessagingEnabledState,
  );
  const isMicrosoftMessagingEnabled = useAtomStateValue(
    isMicrosoftMessagingEnabledState,
  );

  const connectMailbox = (provider: ConnectedAccountProvider) =>
    triggerApisOAuth(provider, {
      redirectLocation: AppPath.GettingStarted,
      messageVisibility: MessageChannelVisibility.METADATA,
      calendarVisibility: CalendarChannelVisibility.METADATA,
      skipMessageChannelConfiguration: true,
    });

  return (
    <StyledColumn>
      <StyledRow>
        <IconLock size={theme.icon.size.sm} />
        <StyledMuted>{t`Teammates see who you talk to, not what you write.`}</StyledMuted>
      </StyledRow>
      <StyledRow>
        <Button
          size="sm"
          disabled={!isGoogleMessagingEnabled}
          startIcon={<IconGoogle />}
          onClick={() => void connectMailbox(ConnectedAccountProvider.GOOGLE)}
        >{t`Continue with Google`}</Button>
        <Button
          size="sm"
          disabled={!isMicrosoftMessagingEnabled}
          startIcon={<IconMicrosoft />}
          onClick={() =>
            void connectMailbox(ConnectedAccountProvider.MICROSOFT)
          }
        >{t`Continue with Microsoft`}</Button>
      </StyledRow>
      {activeAccounts.map((account) => {
        const AccountIcon = SettingsConnectedAccountIcon({ account });

        return (
          <StyledRow key={account.id}>
            <AccountIcon
              size={theme.icon.size.md}
              stroke={theme.icon.stroke.sm}
            />
            <StyledAccountHandle>{account.handle}</StyledAccountHandle>
            <SettingsConnectedAccountSyncStatus account={account} />
          </StyledRow>
        );
      })}
      {hasActiveAccounts && (
        <>
          {isDefined(peopleCount) && isDefined(companyCount) && (
            <StyledMuted>{t`${peopleCount} people and ${companyCount} companies in your workspace`}</StyledMuted>
          )}
          <StyledRow>
            <NavigationButton
              size="sm"
              to={getAppPath(AppPath.RecordIndexPage, {
                objectNamePlural: personObjectMetadataItem.namePlural,
              })}
            >{t`Open people`}</NavigationButton>
            <NavigationButton
              size="sm"
              variant="ghost"
              to={getSettingsPath(SettingsPath.Accounts)}
            >{t`Manage accounts`}</NavigationButton>
          </StyledRow>
        </>
      )}
    </StyledColumn>
  );
};
