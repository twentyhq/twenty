import { getAppPreferencesAppStatusById } from '@/settings/app-preferences/utils/getAppPreferencesAppStatusById';
import {
  ConnectedAccountProvider,
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
  MessageChannelType,
} from 'twenty-shared/types';

const APPLICATION_ID = 'linear-application-id';

const buildAccount = ({
  provider = ConnectedAccountProvider.APP,
  applicationId = APPLICATION_ID,
  archivedAt = null,
  authFailedAt = null,
  messageChannelSyncStatus = MessageChannelSyncStatus.ACTIVE,
}: {
  provider?: ConnectedAccountProvider;
  applicationId?: string | null;
  archivedAt?: string | null;
  authFailedAt?: string | null;
  messageChannelSyncStatus?: MessageChannelSyncStatus;
} = {}) => ({
  provider,
  applicationId,
  archivedAt,
  authFailedAt,
  messageChannels:
    provider === ConnectedAccountProvider.APP
      ? []
      : [
          {
            type: MessageChannelType.EMAIL,
            syncStatus: messageChannelSyncStatus,
            syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
          },
        ],
  calendarChannels: [],
});

const buildApplication = ({
  isClientCredentialsConfigured = true,
  hasConnectionProvider = true,
  hasMissingRequiredVariable = false,
}: {
  isClientCredentialsConfigured?: boolean;
  hasConnectionProvider?: boolean;
  hasMissingRequiredVariable?: boolean;
} = {}) => ({
  application: { id: APPLICATION_ID },
  connectionProviders: hasConnectionProvider
    ? [{ type: 'oauth', oauth: { isClientCredentialsConfigured } }]
    : [],
  missingRequiredVariables: hasMissingRequiredVariable
    ? [{ key: 'API_KEY' }]
    : [],
});

const getStatusOfInstalledApplication = ({
  application = buildApplication(),
  appAccounts = [],
}: {
  application?: ReturnType<typeof buildApplication>;
  appAccounts?: ReturnType<typeof buildAccount>[];
}) =>
  getAppPreferencesAppStatusById({
    groups: [{ id: 'group', handle: 'tim@apple.dev', appAccounts }],
    builtInAccountApps: [],
    applicationsWithPreferences: [application],
  })[APPLICATION_ID];

describe('getAppPreferencesAppStatusById', () => {
  it('flags a built-in app whose active account failed to sync', () => {
    const failedAccount = buildAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      applicationId: null,
      messageChannelSyncStatus: MessageChannelSyncStatus.FAILED_UNKNOWN,
    });

    expect(
      getAppPreferencesAppStatusById({
        groups: [
          {
            id: 'group',
            handle: 'tim@apple.dev',
            builtInAccount: failedAccount,
            appAccounts: [],
          },
        ],
        builtInAccountApps: [{ id: 'google' }, { id: 'outlook' }],
        applicationsWithPreferences: [],
      }),
    ).toEqual({
      google: { type: 'accountSyncIssue', account: failedAccount },
    });
  });

  it('asks to reconnect when an active connection failed to authenticate', () => {
    expect(
      getStatusOfInstalledApplication({
        appAccounts: [buildAccount({ authFailedAt: '2026-09-01' })],
      }),
    ).toEqual({ type: 'reconnectNeeded' });
  });

  it('flags missing configuration when the app is in use', () => {
    expect(
      getStatusOfInstalledApplication({
        application: buildApplication({ hasMissingRequiredVariable: true }),
        appAccounts: [buildAccount()],
      }),
    ).toEqual({ type: 'missingConfiguration' });
    expect(
      getStatusOfInstalledApplication({
        application: buildApplication({
          hasConnectionProvider: false,
          hasMissingRequiredVariable: true,
        }),
      }),
    ).toEqual({ type: 'missingConfiguration' });
  });

  it('hints at connecting when a provider can authorize and nothing is connected', () => {
    expect(getStatusOfInstalledApplication({})).toEqual({
      type: 'notConnected',
    });
    expect(
      getStatusOfInstalledApplication({
        application: buildApplication({ hasMissingRequiredVariable: true }),
        appAccounts: [buildAccount({ archivedAt: '2026-09-01' })],
      }),
    ).toEqual({ type: 'notConnected' });
  });

  it('shows nothing for a connected app, an app without providers or an unconfigured provider', () => {
    expect(
      getStatusOfInstalledApplication({ appAccounts: [buildAccount()] }),
    ).toBeUndefined();
    expect(
      getStatusOfInstalledApplication({
        application: buildApplication({ hasConnectionProvider: false }),
      }),
    ).toBeUndefined();
    expect(
      getStatusOfInstalledApplication({
        application: buildApplication({
          isClientCredentialsConfigured: false,
        }),
      }),
    ).toBeUndefined();
  });
});
