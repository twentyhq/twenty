import { getAppPreferencesAppStatusesById } from '@/settings/app-preferences/utils/getAppPreferencesAppStatusesById';
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

const getStatusesOfInstalledApplication = ({
  application = buildApplication(),
  appAccounts = [],
}: {
  application?: ReturnType<typeof buildApplication>;
  appAccounts?: ReturnType<typeof buildAccount>[];
}) =>
  getAppPreferencesAppStatusesById({
    groups: [{ id: 'group', handle: 'tim@apple.dev', appAccounts }],
    builtInAccountApps: [],
    applicationsWithPreferences: [application],
  })[APPLICATION_ID];

describe('getAppPreferencesAppStatusesById', () => {
  it('flags a built-in app whose active account failed to sync', () => {
    const failedAccount = buildAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      applicationId: null,
      messageChannelSyncStatus: MessageChannelSyncStatus.FAILED_UNKNOWN,
    });

    expect(
      getAppPreferencesAppStatusesById({
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
      google: [{ type: 'accountSyncIssue', account: failedAccount }],
    });
  });

  it('asks to reconnect when an active connection failed to authenticate', () => {
    expect(
      getStatusesOfInstalledApplication({
        appAccounts: [buildAccount({ authFailedAt: '2026-09-01' })],
      }),
    ).toEqual([{ type: 'reconnectNeeded' }]);
  });

  it('keeps missing configuration alongside a needed reconnect', () => {
    expect(
      getStatusesOfInstalledApplication({
        application: buildApplication({ hasMissingRequiredVariable: true }),
        appAccounts: [buildAccount({ authFailedAt: '2026-09-01' })],
      }),
    ).toEqual([{ type: 'reconnectNeeded' }, { type: 'missingConfiguration' }]);
  });

  it('flags missing configuration when the app is in use', () => {
    expect(
      getStatusesOfInstalledApplication({
        application: buildApplication({ hasMissingRequiredVariable: true }),
        appAccounts: [buildAccount()],
      }),
    ).toEqual([{ type: 'missingConfiguration' }]);
    expect(
      getStatusesOfInstalledApplication({
        application: buildApplication({
          hasConnectionProvider: false,
          hasMissingRequiredVariable: true,
        }),
      }),
    ).toEqual([{ type: 'missingConfiguration' }]);
  });

  it('hints at connecting when a provider can authorize and nothing is connected', () => {
    expect(getStatusesOfInstalledApplication({})).toEqual([
      { type: 'notConnected' },
    ]);
    expect(
      getStatusesOfInstalledApplication({
        application: buildApplication({ hasMissingRequiredVariable: true }),
        appAccounts: [buildAccount({ archivedAt: '2026-09-01' })],
      }),
    ).toEqual([{ type: 'notConnected' }]);
  });

  it('shows nothing for a connected app, an app without providers or an unconfigured provider', () => {
    expect(
      getStatusesOfInstalledApplication({ appAccounts: [buildAccount()] }),
    ).toBeUndefined();
    expect(
      getStatusesOfInstalledApplication({
        application: buildApplication({ hasConnectionProvider: false }),
      }),
    ).toBeUndefined();
    expect(
      getStatusesOfInstalledApplication({
        application: buildApplication({
          isClientCredentialsConfigured: false,
        }),
      }),
    ).toBeUndefined();
  });
});
