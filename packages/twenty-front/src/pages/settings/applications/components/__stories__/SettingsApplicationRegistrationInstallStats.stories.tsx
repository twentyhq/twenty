import { ApolloClient, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { MockLink } from '@apollo/client/testing';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { ApolloAdminClientContext } from '@/settings/admin-panel/apollo/contexts/ApolloAdminClientContext';
import { FindAdminApplicationRegistrationStatsDocument } from '~/generated-admin/graphql';
import {
  type ApplicationRegistrationStats,
  FindApplicationRegistrationStatsDocument,
  UsageOperationType,
} from '~/generated-metadata/graphql';
import { SettingsApplicationRegistrationInstallStats } from '~/pages/settings/applications/components/SettingsApplicationRegistrationInstallStats';

const STATS: ApplicationRegistrationStats = {
  activeInstalls: 4,
  suspendedInstalls: 2,
  onLatestVersion: 2,
  updatesAvailable: 2,
  autoUpdateEnabled: 2,
  workspacesNeedingAttention: 1,
  healthCheckedWorkspaces: 2,
  totalCreditsConsumed: 52.300001,
  creditBreakdown: [
    {
      key: 'app:recordCall',
      label: 'Recorded calls',
      operationType: UsageOperationType.CALL_RECORDING,
      isApplicationBillingEntry: true,
      creditsConsumed: 49.3,
    },
    {
      key: 'type:CODE_EXECUTION',
      label: 'CODE_EXECUTION',
      operationType: UsageOperationType.CODE_EXECUTION,
      isApplicationBillingEntry: false,
      creditsConsumed: 3,
    },
    {
      key: 'type:FUTURE_OPERATION',
      label: 'Future operation',
      operationType: null,
      isApplicationBillingEntry: false,
      creditsConsumed: 0.000001,
    },
  ],
  mostInstalledVersion: '1.2.3',
  versionDistribution: [
    { version: '1.2.3', count: 2 },
    { version: '1.2.2', count: 2 },
  ],
};

const meta = {
  title:
    'Pages/Settings/Applications/SettingsApplicationRegistrationInstallStats',
  component: SettingsApplicationRegistrationInstallStats,
  args: { registration: { id: 'registration-id' } },
  parameters: { container: { width: 800 }, stats: STATS },
  decorators: [
    ComponentDecorator,
    (Story, { args, parameters }) => {
      const isAdminView = args.isAdminView ?? false;
      const client = new ApolloClient({
        cache: new InMemoryCache(),
        link: new MockLink([
          {
            request: {
              query: isAdminView
                ? FindAdminApplicationRegistrationStatsDocument
                : FindApplicationRegistrationStatsDocument,
              variables: { id: 'registration-id' },
            },
            result: {
              data: {
                [isAdminView
                  ? 'findAdminApplicationRegistrationStats'
                  : 'findApplicationRegistrationStats']: parameters.stats,
              },
            },
            maxUsageCount: Infinity,
            delay: 0,
          },
        ]),
      });
      return (
        <ApolloAdminClientContext.Provider value={client}>
          <ApolloProvider client={client}>
            <Story />
          </ApolloProvider>
        </ApolloAdminClientContext.Provider>
      );
    },
  ],
} satisfies Meta<typeof SettingsApplicationRegistrationInstallStats>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Known: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Recorded calls')).toBeVisible();
    await expect(canvas.getByText('Code Execution')).toBeVisible();
    await expect(canvas.getByText('0.000001')).toBeVisible();
    await expect(canvas.getByText('Needs configuration')).toBeVisible();
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.hover(canvas.getByText('1.2.3', { exact: true }));
    await waitFor(() =>
      expect(
        page.getByText('On latest version: 2. Updates available: 2.'),
      ).toBeVisible(),
    );
    await userEvent.unhover(canvas.getByText('1.2.3', { exact: true }));
    await userEvent.hover(canvas.getByText('1', { exact: true }));
    await waitFor(() =>
      expect(
        page.getByText(/2 of 4 installations checked in the last 24 hours/),
      ).toBeVisible(),
    );
    await userEvent.unhover(canvas.getByText('1', { exact: true }));
  },
};

export const Admin: Story = { ...Known, args: { isAdminView: true } };

export const Unknown: Story = {
  parameters: {
    stats: {
      ...STATS,
      workspacesNeedingAttention: null,
      healthCheckedWorkspaces: 0,
      totalCreditsConsumed: null,
      creditBreakdown: null,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('1.2.3 (2), 1.2.2 (2)')).toBeVisible();
    await expect(
      canvas.queryByText('Needs configuration'),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('group', { name: 'Credit consumption' }),
    ).not.toBeInTheDocument();
  },
};

export const ZeroInstalls: Story = {
  parameters: {
    stats: {
      ...STATS,
      activeInstalls: 0,
      onLatestVersion: 0,
      updatesAvailable: 0,
      suspendedInstalls: 0,
      autoUpdateEnabled: 0,
      workspacesNeedingAttention: 0,
      healthCheckedWorkspaces: 0,
      mostInstalledVersion: null,
      versionDistribution: [],
      totalCreditsConsumed: 0,
      creditBreakdown: [],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText('No installations yet.'),
    ).toBeVisible();
    await expect(
      canvas.queryByText('Auto update enabled'),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('group', { name: 'Credit consumption' }),
    ).not.toBeInTheDocument();
  },
};
