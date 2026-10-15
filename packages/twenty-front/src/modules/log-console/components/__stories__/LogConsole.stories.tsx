import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type ExecutionResult, print } from 'graphql';
import { type RequestParams, type Sink } from 'graphql-sse';
import { http, HttpResponse } from 'msw';
import { type ReactNode, useEffect } from 'react';
import {
  expect,
  fireEvent,
  screen,
  userEvent,
  waitFor,
  within,
} from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { workspaceMemberFormatPreferencesState } from '@/localization/states/workspaceMemberFormatPreferencesState';
import { LogConsole } from '@/log-console/components/LogConsole';
import { LOG_CONSOLE_TAB_LIST_INSTANCE_ID } from '@/log-console/constants/LogConsoleTabListInstanceId';
import { isLogConsoleFullScreenState } from '@/log-console/states/isLogConsoleFullScreenState';
import { logConsoleActiveSourceIdState } from '@/log-console/states/logConsoleActiveSourceIdState';
import { logConsoleAppAnalyticsApplicationIdState } from '@/log-console/states/logConsoleAppAnalyticsApplicationIdState';
import { logConsoleAppAnalyticsRegistrationIdState } from '@/log-console/states/logConsoleAppAnalyticsRegistrationIdState';
import { logConsoleAppAnalyticsScopeState } from '@/log-console/states/logConsoleAppAnalyticsScopeState';
import { logConsoleDisplayModeState } from '@/log-console/states/logConsoleDisplayModeState';
import { logConsoleFiltersState } from '@/log-console/states/logConsoleFiltersState';
import { logConsoleHeightState } from '@/log-console/states/logConsoleHeightState';
import { logConsoleTimeRangeState } from '@/log-console/states/logConsoleTimeRangeState';
import { logConsoleTimeZoneState } from '@/log-console/states/logConsoleTimeZoneState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { FIND_APPLICATION_ANALYTICS } from '@/settings/application-registrations/graphql/queries/findApplicationAnalytics';
import { FIND_APPLICATION_REGISTRATION_ANALYTICS } from '@/settings/application-registrations/graphql/queries/findApplicationRegistrationAnalytics';
import { FIND_MANY_APPLICATION_REGISTRATIONS } from '@/settings/application-registrations/graphql/queries/findManyApplicationRegistrations';
import { GET_EVENT_LOGS } from '@/settings/event-logs/graphql/queries/getEventLogs';
import { EVENT_LOGS_LIVE_SUBSCRIPTION } from '@/settings/event-logs/graphql/subscriptions/EventLogsLiveSubscription';
import { SidePanelForDesktop } from '@/side-panel/components/SidePanelForDesktop';
import { SidePanelToggleButton } from '@/side-panel/components/SidePanelToggleButton';
import { sseClientState } from '@/sse-db-event/states/sseClientState';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { isLogConsoleEnabledState } from '@/log-console/states/isLogConsoleEnabledState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import {
  BillingEntitlementKey,
  EventLogFilterOperand,
  type EventLogRecord,
  type EventLogsLiveSubscription,
  type EventLogsQuery,
  type EventLogsQueryVariables,
  EventLogTable,
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { SettingsObjects } from '~/pages/settings/data-model/SettingsObjects';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks, metadataGraphql } from '~/testing/graphqlMocks';
import { mockedClientConfig } from '~/testing/mock-data/config';
import {
  mockedEventLogApplications,
  mockedEventLogInstalledApplications,
  mockedEventLogLiveApplicationLogs,
  mockedEventLogLogicFunctions,
  mockedEventLogRecordsByTable,
  mockedEventLogWorkspaceMembers,
} from '~/testing/mock-data/event-logs';
import {
  mockCurrentWorkspace,
  mockedUserData,
} from '~/testing/mock-data/users';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getOperationName } from '~/utils/getOperationName';
import { sleep } from '~/utils/sleep';

const WORKSPACE_WITH_LOGS_CONSOLE = {
  ...mockCurrentWorkspace,
  installedApplications: [
    ...mockCurrentWorkspace.installedApplications,
    ...mockedEventLogInstalledApplications,
  ],
  featureFlags: [
    { key: FeatureFlagKey.IS_LOGS_SETTINGS_SECTION_ENABLED, value: true },
  ],
  billingEntitlements: [{ key: BillingEntitlementKey.AUDIT_LOGS, value: true }],
};

const [firstLiveApplicationLog, secondLiveApplicationLog] =
  mockedEventLogLiveApplicationLogs;

const eventLogsLiveSubscriptions = new Map<
  Sink<ExecutionResult<EventLogsLiveSubscription>>,
  RequestParams['variables']
>();

const fakeSseClient = {
  subscribe: (
    request: RequestParams,
    sink: Sink<ExecutionResult<EventLogsLiveSubscription>>,
  ) => {
    if (request.query === print(EVENT_LOGS_LIVE_SUBSCRIPTION)) {
      eventLogsLiveSubscriptions.set(sink, request.variables);
    }

    return () => eventLogsLiveSubscriptions.delete(sink);
  },
};

const emitEventLogsLive = (records: EventLogRecord[]) =>
  eventLogsLiveSubscriptions.forEach((_variables, sink) =>
    sink.next({ data: { eventLogsLive: records } }),
  );

const StyledPageWithSidePanel = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  min-width: 0;
`;

const StyledPageWithLogConsole = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  position: relative;
`;

const PageWithLogConsole = ({ children }: { children: ReactNode }) => (
  <StyledPageWithSidePanel>
    <StyledPageWithLogConsole>
      {children}
      <LogConsole />
    </StyledPageWithLogConsole>
    <SidePanelForDesktop />
  </StyledPageWithSidePanel>
);

const meta: Meta<PageDecoratorArgs> = {
  title: 'Modules/LogConsole/LogConsole',
  component: LogConsole,
  render: () => (
    <PageWithLogConsole>
      <SettingsObjects />
    </PageWithLogConsole>
  ),
  decorators: [
    (Story) => {
      useEffect(() => {
        jotaiStore.set(metadataStoreState.atomFamily('logicFunctions'), {
          current: mockedEventLogLogicFunctions,
          draft: [],
          status: 'up-to-date',
        });
        jotaiStore.set(metadataStoreState.atomFamily('applications'), {
          current: mockedEventLogApplications,
          draft: [],
          status: 'up-to-date',
        });
      }, []);

      return <Story />;
    },
    PageDecorator,
  ],
  args: { routePath: '/settings/objects' },
  beforeEach: () => {
    jotaiStore.set(currentWorkspaceState.atom, WORKSPACE_WITH_LOGS_CONSOLE);
    jotaiStore.set(currentUserWorkspaceState.atom, {
      ...mockedUserData.currentUserWorkspace,
      permissionFlags: Object.values(PermissionFlagType),
    });
    jotaiStore.set(
      currentWorkspaceMembersState.atom,
      mockedEventLogWorkspaceMembers,
    );
    jotaiStore.set(
      workspaceMemberFormatPreferencesState.atom,
      (formatPreferences) => ({
        ...formatPreferences,
        timeZone: 'Europe/Paris',
        timeFormat: TimeFormat.HOUR_24,
      }),
    );
    jotaiStore.set(isLogConsoleEnabledState.atom, true);
    jotaiStore.set(logConsoleDisplayModeState.atom, 'collapsed');
    jotaiStore.set(logConsoleHeightState.atom, null);
    jotaiStore.set(isLogConsoleFullScreenState.atom, false);
    jotaiStore.set(logConsoleActiveSourceIdState.atom, null);
    jotaiStore.set(logConsoleAppAnalyticsRegistrationIdState.atom, null);
    jotaiStore.set(logConsoleAppAnalyticsApplicationIdState.atom, null);
    jotaiStore.set(logConsoleAppAnalyticsScopeState.atom, 'current-workspace');
  },
  parameters: {
    layout: 'fullscreen',
    mockingDate: new Date('2026-09-24T12:05:00Z'),
    msw: {
      handlers: [
        http.get(`${REACT_APP_SERVER_BASE_URL}/client-config`, () =>
          HttpResponse.json({
            ...mockedClientConfig,
            isClickHouseConfigured: true,
          }),
        ),
        metadataGraphql.query<EventLogsQuery, EventLogsQueryVariables>(
          getOperationName(GET_EVENT_LOGS) ?? '',
          ({ variables }) => {
            const records = (
              mockedEventLogRecordsByTable[variables.input.table] ?? []
            ).filter((record) =>
              (variables.input.filters?.fieldFilters ?? []).every(
                ({ field, operand, values }) =>
                  values.includes(
                    record[field as keyof EventLogRecord] ??
                      record.properties?.[field],
                  ) ===
                  (operand === EventLogFilterOperand.IS),
              ),
            );

            return HttpResponse.json({
              data: {
                eventLogs: {
                  __typename: 'EventLogQueryResult',
                  records,
                  totalCount: records.length,
                  pageInfo: {
                    __typename: 'EventLogPageInfo',
                    endCursor: null,
                    hasNextPage: false,
                  },
                },
              },
            });
          },
        ),
        ...graphqlMocks.handlers,
      ],
    },
  },
};

export default meta;

type Story = StoryObj<typeof LogConsole>;

export const Collapsed: Story = {};

export const RecordChangesOpen: Story = {
  beforeEach: () => {
    jotaiStore.set(logConsoleDisplayModeState.atom, 'open');
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findAllByText('Moved to trash', {}, { timeout: 5000 }),
    ).toHaveLength(3);
  },
};

export const RecordChangeDiff: Story = {
  beforeEach: () => {
    jotaiStore.set(logConsoleDisplayModeState.atom, 'open');
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByText('Lumen Health - Pilot', {}, { timeout: 5000 }),
    );

    await canvas.findByRole('button', { name: 'Close details' });
    await canvas.findByText('Close date');
  },
};

export const RecordDeletion: Story = {
  beforeEach: () => {
    jotaiStore.set(logConsoleDisplayModeState.atom, 'open');
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByText('Maple Consulting Inc.', {}, { timeout: 5000 }),
    );

    await canvas.findByRole('button', { name: 'Close details' });
    await canvas.findByText('Values before deletion');
  },
};

export const SecurityOpen: Story = {
  beforeEach: () => {
    jotaiStore.set(logConsoleDisplayModeState.atom, 'open');
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('tab', { name: 'Security' }, { timeout: 5000 }),
    );

    expect(await canvas.findAllByText('Support team')).toHaveLength(3);
  },
};

export const AppLogsOpen: Story = {
  beforeEach: () => {
    jotaiStore.set(logConsoleDisplayModeState.atom, 'open');
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByRole('tab', { name: 'App logs' }));

    expect(
      await canvas.findAllByText(
        "TypeError: Cannot read properties of undefined (reading 'amount_due')",
      ),
    ).toHaveLength(2);
  },
};

export const AppLogDetail: Story = {
  beforeEach: () => {
    jotaiStore.set(logConsoleDisplayModeState.atom, 'open');
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByRole('tab', { name: 'App logs' }));

    const [typeErrorMessage] = await canvas.findAllByText(
      "TypeError: Cannot read properties of undefined (reading 'amount_due')",
    );

    await userEvent.click(typeErrorMessage);

    await canvas.findByText(
      'at mapInvoiceToOpportunity (src/logic-functions/sync-stripe-invoices.ts:48:31)',
    );

    await userEvent.click(canvas.getByRole('button', { name: 'More (3)' }));

    await canvas.findByText(
      'at async executeLogicFunction (runtime/executor.js:112:18)',
    );

    await userEvent.click(
      canvas.getByRole('button', { name: 'Close details' }),
    );

    expect(
      canvas.queryByText(
        'at async executeLogicFunction (runtime/executor.js:112:18)',
      ),
    ).not.toBeInTheDocument();
  },
};

export const AppLogsLive: Story = {
  beforeEach: () => {
    jotaiStore.set(logConsoleDisplayModeState.atom, 'open');
    jotaiStore.set(
      activeTabIdComponentState.atomFamily({
        instanceId: LOG_CONSOLE_TAB_LIST_INSTANCE_ID,
      }),
      'app-logs',
    );
    jotaiStore.set(sseClientState.atom, fakeSseClient as never);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText(
      'Received 9 invoices from Stripe',
      {},
      { timeout: 5000 },
    );

    expect([...eventLogsLiveSubscriptions.values()]).toEqual([
      { table: EventLogTable.APPLICATION_LOG, fieldFilters: [] },
    ]);

    emitEventLogsLive([firstLiveApplicationLog]);

    const liveMessage = await canvas.findByText('Lead score for Omar Aziz: 72');

    expect(
      liveMessage.compareDocumentPosition(
        canvas.getByText(
          'Missing job title for Omar Aziz, using default title score (20)',
        ),
      ),
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    await userEvent.click(canvas.getByRole('button', { name: 'Pause' }));
    emitEventLogsLive([secondLiveApplicationLog]);
    await sleep(500);

    expect(
      canvas.queryByText('Lead score for Lena Park: 64'),
    ).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Resume' }));

    await canvas.findByText('Lead score for Lena Park: 64');
  },
};

export const Clear: Story = {
  beforeEach: () => {
    jotaiStore.set(logConsoleDisplayModeState.atom, 'open');
    jotaiStore.set(
      activeTabIdComponentState.atomFamily({
        instanceId: LOG_CONSOLE_TAB_LIST_INSTANCE_ID,
      }),
      'app-logs',
    );
    jotaiStore.set(sseClientState.atom, fakeSseClient as never);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const getTextUnderHeader = () => {
      const { left, right, bottom, height } = canvas
        .getByText('Message')
        .getBoundingClientRect();

      return document.elementFromPoint((left + right) / 2, bottom + height / 2)
        ?.textContent;
    };

    await canvas.findByText(
      'Received 9 invoices from Stripe',
      {},
      { timeout: 5000 },
    );
    await userEvent.click(canvas.getByLabelText('More options'));
    await userEvent.click(await screen.findByText('Clear'));

    expect(
      canvas.queryByText('Received 9 invoices from Stripe'),
    ).not.toBeInTheDocument();

    emitEventLogsLive([firstLiveApplicationLog, secondLiveApplicationLog]);

    await waitFor(() =>
      expect(getTextUnderHeader()).toBe('Lead score for Lena Park: 64'),
    );
    expect(
      canvas.queryByText('Received 9 invoices from Stripe'),
    ).not.toBeInTheDocument();
  },
};

const APPLICATION_LOGS_PER_PAGE = 3;

export const LoadNextPage: Story = {
  beforeEach: () => {
    jotaiStore.set(logConsoleDisplayModeState.atom, 'open');
    jotaiStore.set(
      activeTabIdComponentState.atomFamily({
        instanceId: LOG_CONSOLE_TAB_LIST_INSTANCE_ID,
      }),
      'app-logs',
    );
  },
  parameters: {
    msw: {
      handlers: [
        metadataGraphql.query<EventLogsQuery, EventLogsQueryVariables>(
          getOperationName(GET_EVENT_LOGS) ?? '',
          ({ variables }) => {
            const applicationLogs =
              mockedEventLogRecordsByTable[EventLogTable.APPLICATION_LOG] ?? [];
            const pageStart = Number(variables.input.after ?? 0);
            const pageEnd = pageStart + APPLICATION_LOGS_PER_PAGE;
            const hasNextPage = pageEnd < applicationLogs.length;

            return HttpResponse.json({
              data: {
                eventLogs: {
                  __typename: 'EventLogQueryResult',
                  records: applicationLogs.slice(pageStart, pageEnd),
                  totalCount: applicationLogs.length,
                  pageInfo: {
                    __typename: 'EventLogPageInfo',
                    endCursor: hasNextPage ? String(pageEnd) : null,
                    hasNextPage,
                  },
                },
              },
            });
          },
        ),
        ...(meta.parameters?.msw.handlers ?? []),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText(
      'Fetched firmographics for halcyon-robotics.com in 819 ms',
      {},
      { timeout: 5000 },
    );
  },
};

export const WebhookFailureDetail: Story = {
  beforeEach: () => {
    jotaiStore.set(logConsoleDisplayModeState.atom, 'open');
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('tab', { name: 'Webhooks' }, { timeout: 5000 }),
    );
    await userEvent.click(await canvas.findByText('503'));

    await canvas.findByRole('button', { name: 'Close details' });
    await canvas.findByText('person.created → ingest.northwind-data.io');
    await canvas.findByRole('link', { name: 'Open webhook settings' });
  },
};

export const PageViewsOpen: Story = {
  beforeEach: () => {
    jotaiStore.set(logConsoleDisplayModeState.atom, 'open');
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('tab', { name: 'Page views' }),
    );
    await canvas.findByText('Priya Nair');
  },
};

export const PageViewDetail: Story = {
  beforeEach: () => {
    jotaiStore.set(logConsoleDisplayModeState.atom, 'open');
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('tab', { name: 'Page views' }),
    );
    await userEvent.click(await canvas.findByText('Priya Nair'));

    await canvas.findByRole('button', { name: 'Close details' });
    await canvas.findByText('Session ID');
  },
};

export const UsageOpen: Story = {
  beforeEach: () => {
    jotaiStore.set(logConsoleDisplayModeState.atom, 'open');
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByRole('tab', { name: 'Usage' }));
    await canvas.findByText('Jonas Weber');
    await canvas.findByText('Chats');
    await canvas.findByText('0.0055 credits');
  },
};

export const TimeRangeMenu: Story = {
  beforeEach: () => {
    jotaiStore.set(currentWorkspaceState.atom, {
      ...WORKSPACE_WITH_LOGS_CONSOLE,
      eventLogRetentionDays: 30,
    });
    jotaiStore.set(logConsoleDisplayModeState.atom, 'open');
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByText('Last 24 hours', {}, { timeout: 5000 }),
    );

    expect(
      await screen.findByRole('option', { name: 'Last 90 days' }),
    ).toBeDisabled();
  },
};

export const LastSevenDaysInUtc: Story = {
  beforeEach: () => {
    jotaiStore.set(logConsoleDisplayModeState.atom, 'open');
    jotaiStore.set(logConsoleTimeRangeState.atom, '7d');
    jotaiStore.set(logConsoleTimeZoneState.atom, 'utc');
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('11:57:48.203', {}, { timeout: 5000 });
    await canvas.findAllByText('Updated');
  },
};

export const LevelFilter: Story = {
  beforeEach: () => {
    jotaiStore.set(logConsoleDisplayModeState.atom, 'open');
    jotaiStore.set(
      activeTabIdComponentState.atomFamily({
        instanceId: LOG_CONSOLE_TAB_LIST_INSTANCE_ID,
      }),
      'app-logs',
    );
    jotaiStore.set(logConsoleFiltersState.atom, [
      {
        filterFieldId: 'level',
        operand: EventLogFilterOperand.IS,
        values: ['ERROR', 'WARN'],
      },
    ]);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText(
      'Sync failed: 9 of 9 invoices could not be mapped',
      {},
      { timeout: 5000 },
    );

    expect(
      canvas.queryByText('Received 9 invoices from Stripe'),
    ).not.toBeInTheDocument();
  },
};

export const FilterMenu: Story = {
  beforeEach: () => {
    jotaiStore.set(logConsoleDisplayModeState.atom, 'open');
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('tab', { name: 'App logs' }, { timeout: 5000 }),
    );
    await userEvent.click(await canvas.findByLabelText('More options'));
    await userEvent.click(await screen.findByText('Filter'));
    await userEvent.click(await screen.findByRole('option', { name: 'Level' }));

    expect(
      await screen.findByRole('option', { name: 'Warning' }),
    ).toHaveAttribute('aria-selected', 'false');
  },
};

export const NoFilterMatch: Story = {
  beforeEach: () => {
    jotaiStore.set(logConsoleDisplayModeState.atom, 'open');
    jotaiStore.set(logConsoleFiltersState.atom, [
      {
        filterFieldId: 'object',
        operand: EventLogFilterOperand.IS,
        values: [getMockObjectMetadataItemOrThrow('task').id],
      },
    ]);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('No event logs found', {}, { timeout: 5000 });
  },
};

export const EmptyInRange: Story = {
  beforeEach: () => {
    jotaiStore.set(logConsoleDisplayModeState.atom, 'open');
  },
  parameters: {
    msw: {
      handlers: [
        metadataGraphql.query(getOperationName(GET_EVENT_LOGS) ?? '', () =>
          HttpResponse.json({
            data: {
              eventLogs: {
                __typename: 'EventLogQueryResult',
                records: [],
                totalCount: 0,
                pageInfo: {
                  __typename: 'EventLogPageInfo',
                  endCursor: null,
                  hasNextPage: false,
                },
              },
            },
          }),
        ),
        ...(meta.parameters?.msw.handlers ?? []),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('No event logs found', {}, { timeout: 5000 });
  },
};

export const LoadError: Story = {
  beforeEach: () => {
    jotaiStore.set(logConsoleDisplayModeState.atom, 'open');
  },
  parameters: {
    msw: {
      handlers: [
        metadataGraphql.query(getOperationName(GET_EVENT_LOGS) ?? '', () =>
          HttpResponse.json({
            errors: [{ message: 'ClickHouse is unavailable' }],
          }),
        ),
        ...(meta.parameters?.msw.handlers ?? []),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText(
      'Something went wrong while loading logs. Please try again.',
      {},
      { timeout: 5000 },
    );
  },
};

export const Resized: Story = {
  beforeEach: () => {
    jotaiStore.set(logConsoleDisplayModeState.atom, 'open');
    jotaiStore.set(logConsoleHeightState.atom, 560);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Sarah Chen', {}, { timeout: 5000 });
  },
};

export const FullScreen: Story = {
  render: () => (
    <PageWithLogConsole>
      <PageCardHeader
        title="Companies"
        actionButton={<SidePanelToggleButton />}
      />
    </PageWithLogConsole>
  ),
  beforeEach: () => {
    jotaiStore.set(logConsoleDisplayModeState.atom, 'open');
    jotaiStore.set(isLogConsoleFullScreenState.atom, true);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByRole('button', { name: 'Command Menu' });
    const exitFullScreenButton = await canvas.findByRole('button', {
      name: 'Exit full screen',
    });
    const { x, y, width, height } =
      exitFullScreenButton.getBoundingClientRect();

    expect(
      exitFullScreenButton.contains(
        document.elementFromPoint(x + width / 2, y + height / 2),
      ),
    ).toBe(true);
  },
};

export const LockedTab: Story = {
  beforeEach: () => {
    jotaiStore.set(currentWorkspaceState.atom, {
      ...WORKSPACE_WITH_LOGS_CONSOLE,
      billingEntitlements: [],
    });
    jotaiStore.set(logConsoleDisplayModeState.atom, 'open');
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByRole('tab', { name: 'Security' }));
    await canvas.findByText('Upgrade to access audit logs');
  },
};

export const ClickHouseMissing: Story = {
  beforeEach: () => {
    jotaiStore.set(logConsoleDisplayModeState.atom, 'open');
  },
  parameters: {
    msw: graphqlMocks,
  },
};

const APP_ANALYTICS_REGISTRATION = {
  __typename: 'ApplicationRegistration',
  id: '20202020-7c1e-4a0b-9f3d-5b2a8c4d6e01',
  universalIdentifier: '20202020-7c1e-4a0b-9f3d-5b2a8c4d6e02',
  name: 'Lead scoring',
  sourceType: 'LOCAL',
  logoUrl: null,
  createdAt: '2026-09-20T15:45:00.000Z',
};

const buildAppAnalyticsPoint = ({
  date,
  functionExecutions,
  functionErrors,
}: {
  date: string;
  functionExecutions: number;
  functionErrors: number;
}) => ({
  __typename: 'ApplicationRegistrationAnalyticsTimeSeriesPoint',
  date,
  installSucceeded: 1,
  installFailed: 0,
  upgradeSucceeded: 0,
  upgradeFailed: 0,
  uninstallSucceeded: 0,
  uninstallFailed: 0,
  functionExecutions,
  functionErrors,
  apiRateLimited: 0,
  jobRateLimited: 0,
  creditsCharged: 12.5,
});

const buildAppAnalyticsVersion = ({
  version,
  installSucceeded,
  upgradeSucceeded,
  functionExecutions,
  functionErrors,
  dailyActiveWorkspaces,
}: {
  version: string;
  installSucceeded: number;
  upgradeSucceeded: number;
  functionExecutions: number;
  functionErrors: number;
  dailyActiveWorkspaces: number[];
}) => ({
  __typename: 'ApplicationRegistrationAnalyticsVersion',
  version,
  activeWorkspaces: Math.max(...dailyActiveWorkspaces),
  installSucceeded,
  installFailed: 0,
  upgradeSucceeded,
  upgradeFailed: 0,
  functionExecutions,
  functionErrors,
  timeSeries: ['2026-09-21', '2026-09-22', '2026-09-23'].map((date, index) => ({
    __typename: 'ApplicationRegistrationAnalyticsVersionTimeSeriesPoint',
    date,
    activeWorkspaces: dailyActiveWorkspaces[index],
  })),
});

const APP_ANALYTICS = {
  __typename: 'ApplicationRegistrationAnalytics',
  periodStart: '2026-08-25T00:00:00.000Z',
  periodEnd: '2026-09-24T00:00:00.000Z',
  totals: {
    __typename: 'ApplicationRegistrationAnalyticsTotals',
    installSucceeded: 12,
    installFailed: 1,
    upgradeSucceeded: 4,
    upgradeFailed: 0,
    uninstallSucceeded: 2,
    uninstallFailed: 0,
    functionExecutions: 1840,
    functionErrors: 23,
    apiRateLimited: 6,
    jobRateLimited: 0,
    creditsCharged: 37.5,
    activeWorkspaces: 9,
  },
  timeSeries: [
    buildAppAnalyticsPoint({
      date: '2026-09-21',
      functionExecutions: 610,
      functionErrors: 8,
    }),
    buildAppAnalyticsPoint({
      date: '2026-09-22',
      functionExecutions: 590,
      functionErrors: 6,
    }),
    buildAppAnalyticsPoint({
      date: '2026-09-23',
      functionExecutions: 640,
      functionErrors: 9,
    }),
  ],
  functionErrorsByType: [
    {
      __typename: 'ApplicationRegistrationAnalyticsBreakdownItem',
      key: 'TIMEOUT',
      value: 15,
    },
    {
      __typename: 'ApplicationRegistrationAnalyticsBreakdownItem',
      key: 'THROWN',
      value: 8,
    },
  ],
  functionErrorsByFunction: [
    {
      __typename: 'ApplicationRegistrationAnalyticsBreakdownItem',
      key: 'scoreLead',
      value: 23,
    },
  ],
  functionExecutionsByFunction: [
    {
      __typename: 'ApplicationRegistrationAnalyticsBreakdownItem',
      key: 'scoreLead',
      value: 1840,
    },
  ],
  lifecycleFailuresByErrorCode: [
    {
      __typename: 'ApplicationRegistrationAnalyticsBreakdownItem',
      key: 'APPLICATION_NOT_FOUND',
      value: 1,
    },
  ],
  creditsChargedByOperation: [
    {
      __typename: 'ApplicationRegistrationAnalyticsBreakdownItem',
      key: 'enrich',
      value: 37.5,
    },
  ],
  versions: [
    buildAppAnalyticsVersion({
      version: '1.3.0',
      installSucceeded: 2,
      upgradeSucceeded: 4,
      functionExecutions: 900,
      functionErrors: 18,
      dailyActiveWorkspaces: [1, 3, 4],
    }),
    buildAppAnalyticsVersion({
      version: '1.2.0',
      installSucceeded: 10,
      upgradeSucceeded: 0,
      functionExecutions: 940,
      functionErrors: 5,
      dailyActiveWorkspaces: [6, 4, 2],
    }),
  ],
};

export const AppAnalyticsOpen: Story = {
  beforeEach: () => {
    jotaiStore.set(logConsoleDisplayModeState.atom, 'open');
    jotaiStore.set(
      activeTabIdComponentState.atomFamily({
        instanceId: LOG_CONSOLE_TAB_LIST_INSTANCE_ID,
      }),
      'app-analytics',
    );
    jotaiStore.set(logConsoleAppAnalyticsScopeState.atom, 'all-workspaces');
  },
  parameters: {
    msw: {
      handlers: [
        metadataGraphql.query(
          getOperationName(FIND_MANY_APPLICATION_REGISTRATIONS) ?? '',
          () =>
            HttpResponse.json({
              data: {
                findManyApplicationRegistrations: [APP_ANALYTICS_REGISTRATION],
              },
            }),
        ),
        metadataGraphql.query(
          getOperationName(FIND_APPLICATION_REGISTRATION_ANALYTICS) ?? '',
          () =>
            HttpResponse.json({
              data: { findApplicationRegistrationAnalytics: APP_ANALYTICS },
            }),
        ),
        ...(meta.parameters?.msw.handlers ?? []),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Active workspaces', {}, { timeout: 5000 });
    await canvas.findByText('Lead scoring');
    await canvas.findByText('TIMEOUT');
    await canvas.findByText('Version adoption');
    await canvas.findByText('18 (2%)');
  },
};

export const AppAnalyticsRangeMenu: Story = {
  ...AppAnalyticsOpen,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Active workspaces', {}, { timeout: 5000 });

    await userEvent.click(canvas.getByText('Last 30 days'));

    await screen.findByRole('option', { name: 'Last year' });
    await screen.findByRole('option', { name: 'All time' });

    await userEvent.click(
      await screen.findByRole('option', { name: 'Custom range' }),
    );

    await screen.findByText('Start date');
  },
};

export const AppAnalyticsChartTooltip: Story = {
  ...AppAnalyticsOpen,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Active workspaces', {}, { timeout: 5000 });

    const chartContainer = canvasElement.querySelector(
      '#log-console-app-analytics-executions-line-chart',
    );

    if (!(chartContainer instanceof HTMLElement)) {
      throw new Error('Executions chart not found');
    }

    chartContainer.scrollIntoView();

    const tooltip = await within(chartContainer).findByRole('tooltip');

    // nivo measures the chart and remounts its hover area after mount, so the hover is retried on whatever sits under the pointer
    await waitFor(
      () => {
        const chartSvg = chartContainer.querySelector('svg');

        if (!(chartSvg instanceof SVGElement)) {
          throw new Error('Executions chart is not drawn yet');
        }

        const chartSvgRect = chartSvg.getBoundingClientRect();
        const hoverX = chartSvgRect.left + chartSvgRect.width * 0.6;
        const hoverY = chartSvgRect.top + chartSvgRect.height / 2;
        const hoveredElement = document.elementFromPoint(hoverX, hoverY);

        if (!isDefined(hoveredElement)) {
          throw new Error('Nothing under the pointer');
        }

        fireEvent.mouseMove(hoveredElement, {
          clientX: hoverX,
          clientY: hoverY,
        });

        expect(tooltip).toHaveStyle({ opacity: '1' });
      },
      { timeout: 5000 },
    );

    // The tooltip is fixed-positioned under a container-type ancestor, where a stale floating-ui copy used to render it far above the chart
    const tooltipRect = tooltip.getBoundingClientRect();
    const chartRect = chartContainer.getBoundingClientRect();

    expect(tooltipRect.left).toBeGreaterThanOrEqual(chartRect.left);
    expect(tooltipRect.right).toBeLessThanOrEqual(chartRect.right);
    expect(tooltipRect.top).toBeGreaterThanOrEqual(chartRect.top);
    expect(tooltipRect.bottom).toBeLessThanOrEqual(chartRect.bottom);
  },
};

export const AppAnalyticsCurrentWorkspace: Story = {
  beforeEach: () => {
    jotaiStore.set(logConsoleDisplayModeState.atom, 'open');
    jotaiStore.set(
      activeTabIdComponentState.atomFamily({
        instanceId: LOG_CONSOLE_TAB_LIST_INSTANCE_ID,
      }),
      'app-analytics',
    );
  },
  parameters: {
    msw: {
      handlers: [
        metadataGraphql.query(
          getOperationName(FIND_MANY_APPLICATION_REGISTRATIONS) ?? '',
          () =>
            HttpResponse.json({
              data: {
                findManyApplicationRegistrations: [APP_ANALYTICS_REGISTRATION],
              },
            }),
        ),
        metadataGraphql.query(
          getOperationName(FIND_APPLICATION_ANALYTICS) ?? '',
          () =>
            HttpResponse.json({
              data: { findApplicationAnalytics: APP_ANALYTICS },
            }),
        ),
        ...(meta.parameters?.msw.handlers ?? []),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText(
      'Aggregated per UTC day for this workspace only. The current day is still accumulating.',
      {},
      { timeout: 5000 },
    );
    expect(canvas.getByText('This workspace')).toBeVisible();
    expect(canvas.getByText('Lead Scoring')).toBeVisible();
    expect(canvas.queryByText('Active workspaces')).not.toBeInTheDocument();
    expect(canvas.queryByText('Version adoption')).not.toBeInTheDocument();
  },
};
