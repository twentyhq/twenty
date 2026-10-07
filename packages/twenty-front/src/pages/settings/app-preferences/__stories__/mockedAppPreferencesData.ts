import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isGoogleCalendarEnabledState } from '@/client-config/states/isGoogleCalendarEnabledState';
import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isImapSmtpCaldavEnabledState } from '@/client-config/states/isImapSmtpCaldavEnabledState';
import { isMicrosoftCalendarEnabledState } from '@/client-config/states/isMicrosoftCalendarEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import { type ClientConfig } from '@/client-config/types/ClientConfig';
import { settingsAccountsSelectedMessageChannelState } from '@/settings/accounts/states/settingsAccountsSelectedMessageChannelState';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { graphql, http, HttpResponse } from 'msw';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedClientConfig } from '~/testing/mock-data/config';
import {
  mockCurrentWorkspace,
  mockedUserData,
} from '~/testing/mock-data/users';
import { mockedApolloClient } from '~/testing/mockedApolloClient';

export const MOCKED_APP_PREFERENCES_WORKSPACE = {
  ...mockCurrentWorkspace,
  featureFlags: [
    { key: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED, value: true },
  ],
};

export const getAppPreferencesMocks = ({
  accounts,
  canManageConnectedAccounts = true,
  clientConfig = {},
  isAppPreferencesEnabled = true,
}: {
  accounts: ConnectedAccount[];
  canManageConnectedAccounts?: boolean;
  clientConfig?: Partial<ClientConfig>;
  isAppPreferencesEnabled?: boolean;
}) => ({
  handlers: [
    graphql.query('GetCurrentUser', () =>
      HttpResponse.json({
        data: {
          currentUser: {
            ...mockedUserData,
            currentWorkspace: {
              ...MOCKED_APP_PREFERENCES_WORKSPACE,
              featureFlags: [
                {
                  key: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
                  value: isAppPreferencesEnabled,
                },
              ],
            },
            currentUserWorkspace: {
              ...mockedUserData.currentUserWorkspace,
              permissionFlags: canManageConnectedAccounts
                ? [PermissionFlagType.CONNECTED_ACCOUNTS]
                : [],
            },
          },
        },
      }),
    ),
    http.get(`${REACT_APP_SERVER_BASE_URL}/client-config`, () =>
      HttpResponse.json({ ...mockedClientConfig, ...clientConfig }),
    ),
    graphql.query('MyConnectedAccounts', () =>
      HttpResponse.json({
        data: {
          myConnectedAccounts: accounts.map((account) => ({
            ...account,
            authFailedReason: null,
            __typename: 'ConnectedAccountPublicDTO',
          })),
        },
      }),
    ),
    graphql.query('MyMessageChannels', () =>
      HttpResponse.json({
        data: {
          myMessageChannels: accounts.flatMap(
            (account) => account.messageChannels,
          ),
        },
      }),
    ),
    graphql.query('MyCalendarChannels', () =>
      HttpResponse.json({
        data: {
          myCalendarChannels: accounts.flatMap(
            (account) => account.calendarChannels,
          ),
        },
      }),
    ),
    graphql.query('MyAppPreferencesApplications', () =>
      HttpResponse.json({ data: { myAppPreferencesApplications: [] } }),
    ),
    graphql.query('MyAppPreferencesConnectedAccounts', () =>
      HttpResponse.json({
        data: {
          myConnectedAccounts: accounts.map((account) => ({
            ...account,
            applicationId: null,
            authFailedReason: null,
            __typename: 'ConnectedAccountPublicDTO',
          })),
        },
      }),
    ),
    ...graphqlMocks.handlers,
  ],
});

export const prepareAppPreferencesStory = async ({
  permissionFlags = [PermissionFlagType.CONNECTED_ACCOUNTS],
  clientConfig = {},
  isAppPreferencesEnabled = true,
}: {
  permissionFlags?: PermissionFlagType[];
  clientConfig?: Partial<ClientConfig>;
  isAppPreferencesEnabled?: boolean;
} = {}) => {
  const previousState = {
    currentWorkspace: jotaiStore.get(currentWorkspaceState.atom),
    currentUserWorkspace: jotaiStore.get(currentUserWorkspaceState.atom),
    selectedMessageChannel: jotaiStore.get(
      settingsAccountsSelectedMessageChannelState.atom,
    ),
    isGoogleCalendarEnabled: jotaiStore.get(isGoogleCalendarEnabledState.atom),
    isGoogleMessagingEnabled: jotaiStore.get(
      isGoogleMessagingEnabledState.atom,
    ),
    isMicrosoftCalendarEnabled: jotaiStore.get(
      isMicrosoftCalendarEnabledState.atom,
    ),
    isMicrosoftMessagingEnabled: jotaiStore.get(
      isMicrosoftMessagingEnabledState.atom,
    ),
    isImapSmtpCaldavEnabled: jotaiStore.get(isImapSmtpCaldavEnabledState.atom),
  };
  const appTabStates = [
    'gmail',
    'google-calendar',
    'outlook',
    'imap-smtp-caldav',
  ].map((builtInAppId) => {
    const tabAtom = activeTabIdComponentState.atomFamily({
      instanceId: `app-preferences-${builtInAppId}`,
    });
    return { tabAtom, previousValue: jotaiStore.get(tabAtom) };
  });
  const storyClientConfig = { ...mockedClientConfig, ...clientConfig };

  await mockedApolloClient.clearStore();
  jotaiStore.set(currentWorkspaceState.atom, {
    ...MOCKED_APP_PREFERENCES_WORKSPACE,
    featureFlags: [
      {
        key: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
        value: isAppPreferencesEnabled,
      },
    ],
  });
  jotaiStore.set(settingsAccountsSelectedMessageChannelState.atom, null);
  appTabStates.forEach(({ tabAtom }) => jotaiStore.set(tabAtom, 'general'));
  jotaiStore.set(currentUserWorkspaceState.atom, {
    ...mockedUserData.currentUserWorkspace,
    permissionFlags,
    isImpersonating: false,
  });
  jotaiStore.set(
    isGoogleCalendarEnabledState.atom,
    storyClientConfig.isGoogleCalendarEnabled,
  );
  jotaiStore.set(
    isGoogleMessagingEnabledState.atom,
    storyClientConfig.isGoogleMessagingEnabled,
  );
  jotaiStore.set(
    isMicrosoftCalendarEnabledState.atom,
    storyClientConfig.isMicrosoftCalendarEnabled,
  );
  jotaiStore.set(
    isMicrosoftMessagingEnabledState.atom,
    storyClientConfig.isMicrosoftMessagingEnabled,
  );
  jotaiStore.set(
    isImapSmtpCaldavEnabledState.atom,
    storyClientConfig.isImapSmtpCaldavEnabled,
  );

  return () => {
    jotaiStore.set(currentWorkspaceState.atom, previousState.currentWorkspace);
    jotaiStore.set(
      currentUserWorkspaceState.atom,
      previousState.currentUserWorkspace,
    );
    jotaiStore.set(
      settingsAccountsSelectedMessageChannelState.atom,
      previousState.selectedMessageChannel,
    );
    appTabStates.forEach(({ tabAtom, previousValue }) =>
      jotaiStore.set(tabAtom, previousValue),
    );
    jotaiStore.set(
      isGoogleCalendarEnabledState.atom,
      previousState.isGoogleCalendarEnabled,
    );
    jotaiStore.set(
      isGoogleMessagingEnabledState.atom,
      previousState.isGoogleMessagingEnabled,
    );
    jotaiStore.set(
      isMicrosoftCalendarEnabledState.atom,
      previousState.isMicrosoftCalendarEnabled,
    );
    jotaiStore.set(
      isMicrosoftMessagingEnabledState.atom,
      previousState.isMicrosoftMessagingEnabled,
    );
    jotaiStore.set(
      isImapSmtpCaldavEnabledState.atom,
      previousState.isImapSmtpCaldavEnabled,
    );
  };
};
