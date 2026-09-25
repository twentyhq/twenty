import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { userEvent, within } from 'storybook/test';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { LogConsole } from '@/log-console/components/LogConsole';
import { isLogConsoleFullScreenState } from '@/log-console/states/isLogConsoleFullScreenState';
import { logConsoleDisplayModeState } from '@/log-console/states/logConsoleDisplayModeState';
import { GET_EVENT_LOGS } from '@/settings/event-logs/graphql/queries/getEventLogs';
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
import { mockedEventLogRecordsByTable } from '~/testing/mock-data/event-logs';
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

const StyledPageWithLogConsole = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  position: relative;
`;

const PageWithLogConsole = () => (
  <StyledPageWithLogConsole>
    <SettingsObjects />
    <LogConsole />
  </StyledPageWithLogConsole>
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
    jotaiStore.set(isAdvancedModeEnabledState.atom, true);
    jotaiStore.set(logConsoleDisplayModeState.atom, 'collapsed');
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

export const AppLogsOpen: Story = {
  beforeEach: () => {
    jotaiStore.set(logConsoleDisplayModeState.atom, 'open');
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByRole('tab', { name: 'App logs' }));
    await canvas.findByText('scoreInboundLead');
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
