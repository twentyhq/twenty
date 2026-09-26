import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type ExecutionResult, print } from 'graphql';
import { type RequestParams, type Sink } from 'graphql-sse';
import { http, HttpResponse } from 'msw';
import { type ReactNode, useEffect } from 'react';
import { expect, screen, userEvent, within } from 'storybook/test';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { workspaceMemberFormatPreferencesState } from '@/localization/states/workspaceMemberFormatPreferencesState';
import { LogConsole } from '@/log-console/components/LogConsole';
import { LOG_CONSOLE_TAB_LIST_INSTANCE_ID } from '@/log-console/constants/LogConsoleTabListInstanceId';
import { isLogConsoleFullScreenState } from '@/log-console/states/isLogConsoleFullScreenState';
import { logConsoleDisplayModeState } from '@/log-console/states/logConsoleDisplayModeState';
import { logConsoleFiltersState } from '@/log-console/states/logConsoleFiltersState';
import { logConsoleHeightState } from '@/log-console/states/logConsoleHeightState';
import { logConsoleSearchState } from '@/log-console/states/logConsoleSearchState';
import { logConsoleTimeRangeState } from '@/log-console/states/logConsoleTimeRangeState';
import { logConsoleTimeZoneState } from '@/log-console/states/logConsoleTimeZoneState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { GET_EVENT_LOGS } from '@/settings/event-logs/graphql/queries/getEventLogs';
import { EVENT_LOGS_LIVE_SUBSCRIPTION } from '@/settings/event-logs/graphql/subscriptions/EventLogsLiveSubscription';
import { SidePanelForDesktop } from '@/side-panel/components/SidePanelForDesktop';
import { SidePanelToggleButton } from '@/side-panel/components/SidePanelToggleButton';
import { sseClientState } from '@/sse-db-event/states/sseClientState';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
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
    jotaiStore.set(isAdvancedModeEnabledState.atom, true);
    jotaiStore.set(logConsoleDisplayModeState.atom, 'collapsed');
    jotaiStore.set(logConsoleHeightState.atom, null);
    jotaiStore.set(isLogConsoleFullScreenState.atom, false);
    jotaiStore.set(logConsoleSearchState.atom, '');
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
            const search = variables.input.filters?.search?.toLowerCase() ?? '';

            const records = (
              mockedEventLogRecordsByTable[variables.input.table] ?? []
            ).filter(
              (record) =>
                (variables.input.filters?.fieldFilters ?? []).every(
                  ({ field, operand, values }) =>
                    values.includes(
                      record[field as keyof EventLogRecord] ??
                        record.properties?.[field],
                    ) ===
                    (operand === EventLogFilterOperand.IS),
                ) &&
                [record.event, record.properties?.message].some((text) =>
                  text?.toLowerCase().includes(search),
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
      { table: EventLogTable.APPLICATION_LOG, fieldFilters: [], search: '' },
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

    expect(getTextUnderHeader()).toBe('');

    emitEventLogsLive([firstLiveApplicationLog, secondLiveApplicationLog]);
    await canvas.findByText('Lead score for Lena Park: 64');

    expect(getTextUnderHeader()).toBe('Lead score for Lena Park: 64');
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
    await canvas.findByText('AI Chat');
    await canvas.findByText('0.0055 credits');
  },
};

export const TimeRangeMenu: Story = {
  beforeEach: () => {
    jotaiStore.set(logConsoleDisplayModeState.atom, 'open');
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('tab', { name: 'App logs' }, { timeout: 5000 }),
    );
    await userEvent.click(await canvas.findByText('Last 24 hours'));

    expect(
      await screen.findByRole('option', { name: 'Last 90 days' }),
    ).toHaveAttribute('aria-disabled', 'true');
  },
};

export const CustomTimeRange: Story = {
  beforeEach: () => {
    jotaiStore.set(logConsoleDisplayModeState.atom, 'open');
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByText('Last 24 hours', {}, { timeout: 5000 }),
    );
    await userEvent.click(await screen.findByText('Custom range...'));

    expect(await screen.findByRole('button', { name: 'Apply' })).toBeEnabled();
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

export const Search: Story = {
  beforeEach: () => {
    jotaiStore.set(logConsoleDisplayModeState.atom, 'open');
    jotaiStore.set(
      activeTabIdComponentState.atomFamily({
        instanceId: LOG_CONSOLE_TAB_LIST_INSTANCE_ID,
      }),
      'app-logs',
    );
    jotaiStore.set(logConsoleSearchState.atom, 'stripe');
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText(
      'Received 9 invoices from Stripe',
      {},
      { timeout: 5000 },
    );

    expect(canvas.getByPlaceholderText('Search logs')).toHaveValue('stripe');
    expect(
      canvas.queryByText(
        'Missing job title for Omar Aziz, using default title score (20)',
      ),
    ).not.toBeInTheDocument();
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
    const closeButton = await canvas.findByRole('button', { name: 'Close' });
    const { x, y, width, height } = closeButton.getBoundingClientRect();

    expect(
      closeButton.contains(
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

    await userEvent.click(
      await canvas.findByRole('tab', { name: 'Record changes' }),
    );
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
