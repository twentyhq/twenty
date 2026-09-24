import { type Meta, type StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { expect, userEvent, within } from 'storybook/test';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { workspaceMemberFormatPreferencesState } from '@/localization/states/workspaceMemberFormatPreferencesState';
import { GET_EVENT_LOGS } from '@/settings/event-logs/graphql/queries/getEventLogs';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import {
  BillingEntitlementKey,
  type EventLogsQuery,
  type EventLogsQueryVariables,
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { SettingsLogsPage } from '~/pages/settings/log-explorer/SettingsLogsPage';
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

const WORKSPACE_WITH_LOGS_SETTINGS_SECTION = {
  ...mockCurrentWorkspace,
  featureFlags: [
    { key: FeatureFlagKey.IS_LOGS_SETTINGS_SECTION_ENABLED, value: true },
  ],
};

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Logs/SettingsLogsPage',
  component: SettingsLogsPage,
  decorators: [PageDecorator],
  args: { routePath: '/settings/logs' },
  beforeEach: () => {
    jotaiStore.set(currentWorkspaceState.atom, {
      ...WORKSPACE_WITH_LOGS_SETTINGS_SECTION,
      billingEntitlements: [
        { key: BillingEntitlementKey.AUDIT_LOGS, value: true },
      ],
    });
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
  },
  parameters: {
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

type Story = StoryObj<typeof SettingsLogsPage>;

export const RecordChanges: Story = {};

export const AppLogs: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('link', { name: 'App logs' }),
    );

    expect(
      await canvas.findAllByText(
        "TypeError: Cannot read properties of undefined (reading 'amount_due')",
      ),
    ).toHaveLength(2);
  },
};

export const PageViews: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('link', { name: 'Page views' }),
    );
    await canvas.findByText('Priya Nair');
  },
};

export const LoadError: Story = {
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

    await canvas.findByText("Couldn't load logs");
    await canvas.findByRole('button', { name: 'Try again' });
  },
};

export const NoLogs: Story = {
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

    await canvas.findByText('No logs yet');
  },
};

export const LockedSources: Story = {
  beforeEach: () => {
    jotaiStore.set(currentWorkspaceState.atom, {
      ...WORKSPACE_WITH_LOGS_SETTINGS_SECTION,
      billingEntitlements: [],
    });
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('link', { name: 'Record changes' }),
    );
    await canvas.findByText('Audit logs are part of the Organization plan');
  },
};
