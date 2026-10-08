import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { type CalendarChannel } from '@/accounts/types/CalendarChannel';
import { graphql, HttpResponse } from 'msw';
import { fn } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import {
  MOCKED_GOOGLE_CONNECTED_ACCOUNT,
  MOCKED_OUTLOOK_CALENDAR_ACCOUNT,
} from '~/pages/settings/accounts/__stories__/mockedConnectedAccounts';
import {
  getAppPreferencesChannelMocks,
  MOCKED_SECOND_GOOGLE_ACCOUNT,
} from '~/pages/settings/app-preferences/__stories__/mockedAppPreferencesChannels';

export const MOCKED_ACCOUNT_ENTRY_ACCOUNTS = [
  MOCKED_GOOGLE_CONNECTED_ACCOUNT,
  MOCKED_SECOND_GOOGLE_ACCOUNT,
  { ...MOCKED_OUTLOOK_CALENDAR_ACCOUNT, messageChannels: [] },
];

export const nativeAccountReads = fn();
export const nativeMessageReads = fn();
export const nativeCalendarReads = fn();

export const getAccountEntryMocks = ({
  accounts = MOCKED_ACCOUNT_ENTRY_ACCOUNTS,
  failFirstAccountRead = false,
  failFirstMessageRead = false,
  failFirstCalendarRead = false,
  permissionFlags = [PermissionFlagType.CONNECTED_ACCOUNTS],
}: {
  accounts?: ConnectedAccount[];
  failFirstAccountRead?: boolean;
  failFirstMessageRead?: boolean;
  failFirstCalendarRead?: boolean;
  permissionFlags?: PermissionFlagType[];
} = {}) => {
  const channelMocks = getAppPreferencesChannelMocks({
    accounts,
    permissionFlags,
  });
  let requestedCalendarReadCount = 0;
  const reset = () => {
    channelMocks.reset();
    nativeAccountReads.mockClear();
    nativeMessageReads.mockClear();
    nativeCalendarReads.mockClear();
    requestedCalendarReadCount = 0;
  };

  return {
    reset,
    handlers: [
      ...(failFirstAccountRead
        ? [
            graphql.query('MyConnectedAccounts', () => {
              nativeAccountReads();
              if (nativeAccountReads.mock.calls.length === 1) {
                return HttpResponse.json({
                  errors: [{ message: 'Account read failed' }],
                });
              }
              return HttpResponse.json({
                data: {
                  myConnectedAccounts: accounts.map((account) => ({
                    ...account,
                    authFailedReason: null,
                    __typename: 'ConnectedAccountPublicDTO',
                  })),
                },
              });
            }),
          ]
        : []),
      ...(failFirstMessageRead
        ? [
            graphql.query('MyMessageChannels', () => {
              nativeMessageReads();
              if (nativeMessageReads.mock.calls.length === 1) {
                return HttpResponse.json({
                  errors: [{ message: 'Message channel read failed' }],
                });
              }
              return HttpResponse.json({
                data: {
                  myMessageChannels: accounts.flatMap(
                    (account) => account.messageChannels,
                  ),
                },
              });
            }),
          ]
        : []),
      ...(failFirstCalendarRead
        ? [
            graphql.query<
              { myCalendarChannels: CalendarChannel[] },
              { connectedAccountId?: string }
            >('MyCalendarChannels', ({ variables }) => {
              nativeCalendarReads(variables);
              if (isDefined(variables.connectedAccountId)) {
                requestedCalendarReadCount += 1;
              }
              if (
                isDefined(variables.connectedAccountId) &&
                requestedCalendarReadCount === 1
              ) {
                return HttpResponse.json({
                  errors: [{ message: 'Shared calendar read failed' }],
                });
              }
              return HttpResponse.json({
                data: {
                  myCalendarChannels: accounts
                    .filter((account) =>
                      isDefined(variables.connectedAccountId)
                        ? account.id === variables.connectedAccountId
                        : account.userWorkspaceId === 'user-workspace',
                    )
                    .flatMap((account) => account.calendarChannels),
                },
              });
            }),
          ]
        : []),
      ...channelMocks.handlers,
    ],
  };
};
