import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isGoogleCalendarEnabledState } from '@/client-config/states/isGoogleCalendarEnabledState';
import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isImapSmtpCaldavEnabledState } from '@/client-config/states/isImapSmtpCaldavEnabledState';
import { isMicrosoftCalendarEnabledState } from '@/client-config/states/isMicrosoftCalendarEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import { type ClientConfig } from '@/client-config/types/ClientConfig';
import { getEmptyPageInfo } from '@/object-record/cache/utils/getEmptyPageInfo';
import { settingsAccountsSelectedMessageChannelState } from '@/settings/accounts/states/settingsAccountsSelectedMessageChannelState';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { graphql, http, HttpResponse } from 'msw';
import { isDefined } from 'twenty-shared/utils';
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
  mockedWorkspaceMemberData,
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
  userWorkspaceId = 'user-workspace',
  permissionFlags = [PermissionFlagType.CONNECTED_ACCOUNTS],
}: {
  accounts: ConnectedAccount[];
  canManageConnectedAccounts?: boolean;
  clientConfig?: Partial<ClientConfig>;
  isAppPreferencesEnabled?: boolean;
  userWorkspaceId?: string;
  permissionFlags?: PermissionFlagType[];
}) => ({
  handlers: [
    graphql.query('GetCurrentUser', () =>
      HttpResponse.json({
        data: {
          currentUser: {
            ...mockedUserData,
            previousOnboardingStatus: null,
            isWorkspaceCreator: false,
            deletedWorkspaceMembers: [],
            workspaceMembers: [
              { ...mockedWorkspaceMemberData, userWorkspaceId },
            ],
            workspaceMember: {
              ...mockedWorkspaceMemberData,
              userWorkspaceId,
              uiScale: 'Default',
              openRecordIn: 'SIDE_PANEL',
              calendarStartDay: null,
              numberFormat: null,
            },
            currentWorkspace: {
              ...MOCKED_APP_PREFERENCES_WORKSPACE,
              customDomain: null,
              billingCustomer: null,
              defaultRole: null,
              aiAdditionalInstructions: null,
              editableProfileFields: null,
              installedApplications:
                MOCKED_APP_PREFERENCES_WORKSPACE.installedApplications.map(
                  (application) => ({ ...application, logoUrl: null }),
                ),
              currentBillingSubscription: {
                ...MOCKED_APP_PREFERENCES_WORKSPACE.currentBillingSubscription,
                cancelAt: null,
              },
              billingSubscriptions:
                MOCKED_APP_PREFERENCES_WORKSPACE.billingSubscriptions.map(
                  (subscription) => ({ ...subscription, cancelAt: null }),
                ),
              featureFlags: [
                {
                  key: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
                  value: isAppPreferencesEnabled,
                },
              ],
            },
            currentUserWorkspace: {
              ...mockedUserData.currentUserWorkspace,
              id: userWorkspaceId,
              isImpersonating: false,
              permissionFlags: canManageConnectedAccounts
                ? permissionFlags
                : [],
            },
          },
        },
      }),
    ),
    http.get(`${REACT_APP_SERVER_BASE_URL}/client-config`, () =>
      HttpResponse.json({ ...mockedClientConfig, ...clientConfig }),
    ),
    graphql.query('FindManyBlocklists', () =>
      HttpResponse.json({
        data: {
          blocklists: {
            edges: [],
            pageInfo: getEmptyPageInfo(),
            totalCount: 0,
          },
        },
      }),
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
    graphql.query<
      { myCalendarChannels: ConnectedAccount['calendarChannels'] },
      { connectedAccountId?: string }
    >('MyCalendarChannels', ({ variables }) =>
      HttpResponse.json({
        data: {
          myCalendarChannels: accounts
            .filter((account) =>
              isDefined(variables.connectedAccountId)
                ? account.id === variables.connectedAccountId
                : account.userWorkspaceId === userWorkspaceId,
            )
            .flatMap((account) => account.calendarChannels),
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
  userWorkspaceId = 'user-workspace',
}: {
  permissionFlags?: PermissionFlagType[];
  clientConfig?: Partial<ClientConfig>;
  isAppPreferencesEnabled?: boolean;
  userWorkspaceId?: string;
} = {}) => {
  const previousState = {
    currentWorkspace: jotaiStore.get(currentWorkspaceState.atom),
    currentUserWorkspace: jotaiStore.get(currentUserWorkspaceState.atom),
    currentWorkspaceMember: jotaiStore.get(currentWorkspaceMemberState.atom),
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
  jotaiStore.set(currentWorkspaceMemberState.atom, {
    ...mockedWorkspaceMemberData,
    userWorkspaceId,
  });
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
      currentWorkspaceMemberState.atom,
      previousState.currentWorkspaceMember,
    );
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
