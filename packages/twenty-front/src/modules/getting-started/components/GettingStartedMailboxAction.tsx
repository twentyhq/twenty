import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsConnectedAccountsTableHeader } from '@/settings/accounts/components/SettingsConnectedAccountsTableHeader';
import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { SettingsConnectedAccountsTableRow } from '@/settings/components/SettingsConnectedAccountsTableRow';
import { NavigationButton } from '@/ui/input/components/NavigationButton';
import { Table } from '@/ui/layout/table/components/Table';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import {
  AppPath,
  ConnectedAccountProvider,
  CoreObjectNameSingular,
} from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { Callout } from 'twenty-ui/components/feedback';
import { IconGoogle, IconLock, IconMicrosoft } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';
import {
  CalendarChannelVisibility,
  MessageChannelVisibility,
} from '~/generated-metadata/graphql';

const StyledColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledProviderButtons = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: 1fr 1fr;
`;

const StyledFooter = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

export const GettingStartedMailboxAction = () => {
  const { t } = useLingui();
  const { triggerApisOAuth } = useTriggerApisOAuth();
  const { accounts } = useMyConnectedAccounts();
  const activeAccounts = accounts.filter(
    (account) => !isDefined(account.archivedAt),
  );
  const hasActiveAccounts = activeAccounts.length > 0;
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
      <Callout
        status="neutral"
        icon={<IconLock />}
        title={t`Teammates see who you talk to, not what you write.`}
      />
      <StyledProviderButtons>
        <Button
          size="sm"
          fullWidth
          disabled={!isGoogleMessagingEnabled}
          startIcon={<IconGoogle />}
          onClick={() => void connectMailbox(ConnectedAccountProvider.GOOGLE)}
        >{t`Continue with Google`}</Button>
        <Button
          size="sm"
          fullWidth
          disabled={!isMicrosoftMessagingEnabled}
          startIcon={<IconMicrosoft />}
          onClick={() =>
            void connectMailbox(ConnectedAccountProvider.MICROSOFT)
          }
        >{t`Continue with Microsoft`}</Button>
      </StyledProviderButtons>
      {hasActiveAccounts && (
        <>
          <Table>
            <SettingsConnectedAccountsTableHeader />
            {activeAccounts.map((account) => (
              <SettingsConnectedAccountsTableRow
                key={account.id}
                account={account}
              />
            ))}
          </Table>
          <StyledFooter>
            <Text size="sm" color="tertiary">
              {isDefined(peopleCount) &&
                isDefined(companyCount) &&
                t`${peopleCount} people and ${companyCount} companies in your workspace`}
            </Text>
            <NavigationButton
              size="sm"
              to={getAppPath(AppPath.RecordIndexPage, {
                objectNamePlural: CoreObjectNamePlural.Person,
              })}
            >{t`Open people`}</NavigationButton>
          </StyledFooter>
        </>
      )}
    </StyledColumn>
  );
};
