import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { themeCssVariables } from 'twenty-ui/theme';

import { billingState } from '@/client-config/states/billingState';
import { ApplicationMonitoring } from '@/settings/application-monitoring/components/ApplicationMonitoring';
import { type ApplicationMonitoringData } from '@/settings/application-monitoring/types/ApplicationMonitoringData';
import { SETTINGS_CONTENT_MAX_WIDTH } from '@/settings/constants/SettingsContentMaxWidth';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { UsageOperationType } from '~/generated-metadata/graphql';
import { mockedClientConfig } from '~/testing/mock-data/config';

const StyledSettingsContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[8]};
  width: ${SETTINGS_CONTENT_MAX_WIDTH}px;
`;

const MONITORING: ApplicationMonitoringData = {
  periodStart: '2026-10-12T08:00:00.000Z',
  periodEnd: '2026-10-19T08:00:00.000Z',
  bucketSizeInSeconds: 86400,
  lookbackInHours: 2160,
  runCount: 7930,
  failedRunCount: 139,
  lifecycleFailureCount: 3,
  rateLimitEventCount: 3525,
  creditsUsed: 184.5,
  activity: [
    ['2026-10-13', 12, 120, 0],
    ['2026-10-14', 18, 0, 0],
    ['2026-10-15', 9, 340, 12],
    ['2026-10-16', 14, 0, 0],
    ['2026-10-17', 41, 2100, 40],
    ['2026-10-18', 30, 860, 8],
    ['2026-10-19', 18, 45, 0],
  ].map(([day, errorCount, rateLimitedRequestCount, rateLimitedJobCount]) => ({
    bucketStart: `${day}T00:00:00.000Z`,
    errorCount: Number(errorCount),
    rateLimitedRequestCount: Number(rateLimitedRequestCount),
    rateLimitedJobCount: Number(rateLimitedJobCount),
  })),
  lifecycle: [
    {
      bucketStart: '2026-10-16T00:00:00.000Z',
      installCount: 0,
      upgradeCount: 5,
      uninstallCount: 0,
      failedCount: 1,
    },
    {
      bucketStart: '2026-10-17T00:00:00.000Z',
      installCount: 1,
      upgradeCount: 8,
      uninstallCount: 1,
      failedCount: 0,
    },
    {
      bucketStart: '2026-10-18T00:00:00.000Z',
      installCount: 1,
      upgradeCount: 4,
      uninstallCount: 0,
      failedCount: 2,
    },
  ],
  creditUsage: (
    [
      ['2026-10-13', UsageOperationType.CODE_EXECUTION, 21],
      ['2026-10-14', UsageOperationType.CODE_EXECUTION, 24.5],
      ['2026-10-16', UsageOperationType.CODE_EXECUTION, 30],
      ['2026-10-17', UsageOperationType.CODE_EXECUTION, 12],
      ['2026-10-17', UsageOperationType.AI_WORKFLOW_TOKEN, 50],
      ['2026-10-18', UsageOperationType.CODE_EXECUTION, 7],
      ['2026-10-18', UsageOperationType.AI_WORKFLOW_TOKEN, 40],
    ] as const
  ).map(([day, operationType, creditsUsed]) => ({
    bucketStart: `${day}T00:00:00.000Z`,
    operationType,
    creditsUsed,
  })),
  issues: [
    {
      level: 'ERROR',
      source: 'LOGIC_FUNCTION',
      errorCode: 'AUTHENTICATION_FAILED',
      logicFunctionName: 'syncContacts',
      versions: ['1.2.3'],
      eventCount: 96,
      affectedInstallCount: 5,
      lastSeenAt: '2026-10-19T07:41:12.204Z',
    },
    {
      level: 'WARN',
      source: 'API_RATE_LIMIT',
      errorCode: 'RATE_LIMITED',
      logicFunctionName: '',
      versions: ['1.2.2', '1.2.3'],
      eventCount: 61,
      affectedInstallCount: 4,
      lastSeenAt: '2026-10-19T06:55:00.120Z',
    },
    {
      level: 'ERROR',
      source: 'UPGRADE',
      errorCode: 'UPGRADE_FAILED',
      logicFunctionName: '',
      versions: ['1.2.3'],
      eventCount: 2,
      affectedInstallCount: 2,
      lastSeenAt: '2026-10-18T22:47:03.112Z',
    },
  ],
  versions: [
    {
      version: '1.2.3',
      runCount: 6600,
      failedRunCount: 96,
      activeInstallCount: 20,
    },
    {
      version: '1.2.2',
      runCount: 1330,
      failedRunCount: 43,
      activeInstallCount: 4,
    },
  ],
  functions: [
    {
      logicFunctionName: 'syncContacts',
      runCount: 4210,
      failedRunCount: 96,
      p95DurationMs: 1400,
    },
    {
      logicFunctionName: 'sendMessage',
      runCount: 2980,
      failedRunCount: 43,
      p95DurationMs: 600,
    },
  ],
};

const meta: Meta<typeof ApplicationMonitoring> = {
  title: 'Modules/Settings/ApplicationMonitoring/ApplicationMonitoring',
  component: ApplicationMonitoring,
  args: {
    instanceId: 'application-monitoring-story',
    monitoring: MONITORING,
    selectedPeriod: '7d',
    onPeriodChange: () => {},
    onRefresh: () => {},
  },
  decorators: [
    (Story) => (
      <StyledSettingsContent>
        <Story />
      </StyledSettingsContent>
    ),
    ComponentDecorator,
  ],
  beforeEach: () => {
    jotaiStore.set(billingState.atom, mockedClientConfig.billing);
  },
};

export default meta;
type Story = StoryObj<typeof ApplicationMonitoring>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('AUTHENTICATION_FAILED')).toBeVisible();
    expect(
      canvas.getByRole('heading', {
        name: 'Installs, upgrades and uninstalls',
      }),
    ).toBeVisible();
    expect(await canvas.findByText(/^Errors \([\d,]+\)$/)).toBeVisible();
    expect(await canvas.findByText(/^API requests \([\d,]+\)$/)).toBeVisible();
    expect(canvas.getByText('Code Execution (94)')).toBeVisible();
    expect(canvas.getByText('Agents (90)')).toBeVisible();
    expect(
      canvas.getByText(
        '184 credits by operation type, across every install in this period',
      ),
    ).toBeVisible();
    expect(canvas.queryByText(/Your plan shows/)).not.toBeInTheDocument();
  },
};

export const BillingDisabled: Story = {
  beforeEach: () => {
    jotaiStore.set(billingState.atom, {
      ...mockedClientConfig.billing,
      isBillingEnabled: false,
    });
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('AUTHENTICATION_FAILED')).toBeVisible();
    expect(
      canvas.queryByRole('heading', { name: 'Credits used' }),
    ).not.toBeInTheDocument();
  },
};

export const Refresh: Story = {
  args: {
    onRefresh: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Refresh' }),
    );

    await expect(args.onRefresh).toHaveBeenCalledTimes(1);
  },
};

export const ProPlan: Story = {
  args: {
    monitoring: { ...MONITORING, lookbackInHours: 2 },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(/Your plan shows the last 2 hours/),
    ).toBeVisible();
  },
};

export const NoActivity: Story = {
  args: {
    monitoring: {
      ...MONITORING,
      runCount: 0,
      failedRunCount: 0,
      lifecycleFailureCount: 0,
      rateLimitEventCount: 0,
      creditsUsed: 0,
      activity: [],
      lifecycle: [],
      creditUsage: [],
      issues: [],
      versions: [],
      functions: [],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('No activity in this period')).toBeVisible();
    expect(
      canvas.getByText('No errors or warnings in this period'),
    ).toBeVisible();
    expect(canvas.getByText('No rate limit hit in this period')).toBeVisible();
    expect(canvas.getByText('No credits used in this period')).toBeVisible();
  },
};

export const CreditsUnavailable: Story = {
  args: {
    monitoring: { ...MONITORING, creditsUsed: null, creditUsage: null },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(
        'Credits used could not be loaded. Refresh to try again.',
      ),
    ).toBeVisible();
    expect(
      canvas.queryByText('No credits used in this period'),
    ).not.toBeInTheDocument();
    expect(canvas.getByText('AUTHENTICATION_FAILED')).toBeVisible();
  },
};
