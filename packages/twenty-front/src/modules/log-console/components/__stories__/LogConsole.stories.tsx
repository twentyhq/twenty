import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { expect, screen, userEvent, within } from 'storybook/test';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { workspaceMemberFormatPreferencesState } from '@/localization/states/workspaceMemberFormatPreferencesState';
import { LogConsole } from '@/log-console/components/LogConsole';
import { LOG_CONSOLE_HEIGHT_CONSTRAINTS } from '@/log-console/constants/LogConsoleHeightConstraints';
import { isLogConsoleFullScreenState } from '@/log-console/states/isLogConsoleFullScreenState';
import { logConsoleDisplayModeState } from '@/log-console/states/logConsoleDisplayModeState';
import { logConsoleHeightState } from '@/log-console/states/logConsoleHeightState';
import { logConsoleTimeRangeState } from '@/log-console/states/logConsoleTimeRangeState';
import { logConsoleTimeZoneState } from '@/log-console/states/logConsoleTimeZoneState';
import { GET_EVENT_LOGS } from '@/settings/event-logs/graphql/queries/getEventLogs';
import { SidePanelForDesktop } from '@/side-panel/components/SidePanelForDesktop';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import {
  BillingEntitlementKey,
  type EventLogsQuery,
  type EventLogsQueryVariables,
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
  mockedEventLogRecordsByTable,
  mockedEventLogWorkspaceMembers,
} from '~/testing/mock-data/event-logs';
import {
  mockCurrentWorkspace,
  mockedUserData,
} from '~/testing/mock-data/users';
import { getOperationName } from '~/utils/getOperationName';

const WORKSPACE_WITH_LOGS_CONSOLE = {
  ...mockCurrentWorkspace,
  featureFlags: [
    { key: FeatureFlagKey.IS_LOGS_SETTINGS_SECTION_ENABLED, value: true },
  ],
  billingEntitlements: [{ key: BillingEntitlementKey.AUDIT_LOGS, value: true }],
};

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

const PageWithLogConsole = () => (
  <StyledPageWithSidePanel>
    <StyledPageWithLogConsole>
      <SettingsObjects />
      <LogConsole />
    </StyledPageWithLogConsole>
    <SidePanelForDesktop />
  </StyledPageWithSidePanel>
);

const meta: Meta<PageDecoratorArgs> = {
  title: 'Modules/LogConsole/LogConsole',
  component: LogConsole,
  render: () => <PageWithLogConsole />,
  decorators: [PageDecorator],
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
    jotaiStore.set(
      logConsoleHeightState.atom,
      LOG_CONSOLE_HEIGHT_CONSTRAINTS.default,
    );
    jotaiStore.set(isLogConsoleFullScreenState.atom, false);
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
            const records =
              mockedEventLogRecordsByTable[variables.input.table] ?? [];

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

    await canvas.findByText('Proposal');
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

    await canvas.findByText('Values before deletion');
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

    await canvas.findByText(/at mapInvoiceToOpportunity/, { selector: 'pre' });
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

    await screen.findByText('Sep 23, 2026 14:05');
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

    await canvas.findByText('Sep 24 11:57:48', {}, { timeout: 5000 });
    await canvas.findByText('8 changes · Sep 17, 12:05 – Sep 24, 12:05');
    await canvas.findByText('UTC');
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

    await canvas.findByText(
      'No logs in this time range',
      {},
      { timeout: 5000 },
    );
    await canvas.findByRole('button', { name: 'Search last 7 days' });
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

    await canvas.findByText("Couldn't load logs", {}, { timeout: 5000 });
    await canvas.findByRole('button', { name: 'Try again' });
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
  beforeEach: () => {
    jotaiStore.set(logConsoleDisplayModeState.atom, 'open');
    jotaiStore.set(isLogConsoleFullScreenState.atom, true);
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
    await canvas.findByText('Audit logs are part of the Organization plan');
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
