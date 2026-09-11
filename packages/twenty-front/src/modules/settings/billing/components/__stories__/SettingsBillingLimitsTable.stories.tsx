import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';

import { SettingsBillingLimitsTable } from '@/settings/billing/components/SettingsBillingLimitsTable';
import { type UsageQuotaWithConsumption } from '@/settings/billing/types/UsageQuotaWithConsumption';
import {
  UsageOperationType,
  UsageResourceType,
} from '~/generated-metadata/graphql';

const buildQuota = (
  overrides: Partial<UsageQuotaWithConsumption>,
): UsageQuotaWithConsumption => ({
  __typename: 'UsageQuotaWithConsumption',
  id: 'limit-1',
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.AI_CHAT_TOKEN,
  spenderType: 'workspace',
  spenderId: null,
  spenderLabel: null,
  periodUnit: 'month',
  meter: 'creditsUsedMicro',
  limitValue: 100_000_000,
  isEnforced: true,
  consumedValue: 23_860_000,
  remainingValue: 76_140_000,
  periodStart: '2026-09-01T00:00:00.000Z',
  periodEnd: '2026-10-01T00:00:00.000Z',
  ...overrides,
});

const ALL_OPERATIONS_QUOTA = buildQuota({
  id: 'limit-all-operations',
  operationType: UsageOperationType.ALL,
  periodUnit: 'allowancePeriod',
});

const CUSTOM_USER_QUOTA = buildQuota({
  spenderType: 'userWorkspace',
  spenderId: 'a1b2c3d4-0000-0000-0000-000000000000',
  spenderLabel: 'Tim Apple',
  isEnforced: false,
});

const API_KEY_QUOTA = buildQuota({
  id: 'limit-2',
  resourceType: UsageResourceType.API,
  operationType: UsageOperationType.API_REQUEST,
  spenderType: 'apiKey',
  spenderId: 'b1b2c3d4-0000-0000-0000-000000000000',
  spenderLabel: 'Production key',
  periodUnit: 'day',
  meter: 'quantity',
  limitValue: 10_000,
  consumedValue: 9_800,
  remainingValue: 200,
});

const meta: Meta<typeof SettingsBillingLimitsTable> = {
  title: 'Modules/Settings/Billing/SettingsBillingLimitsTable',
  component: SettingsBillingLimitsTable,
  decorators: [ComponentDecorator, RouterDecorator],
  args: { quotas: [ALL_OPERATIONS_QUOTA, CUSTOM_USER_QUOTA, API_KEY_QUOTA] },
};

export default meta;
type Story = StoryObj<typeof SettingsBillingLimitsTable>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.hover(await canvas.findByText('Deactivated'));

    const tooltip = await within(canvasElement.ownerDocument.body).findByRole(
      'tooltip',
      {},
      { timeout: 2000 },
    );

    await waitFor(() =>
      expect(tooltip).toHaveTextContent('require the Organization plan'),
    );
  },
};

export const Exhausted: Story = {
  args: {
    quotas: [buildQuota({ consumedValue: 100_000_000, remainingValue: 0 })],
  },
  play: async ({ canvasElement }) => {
    expect(await within(canvasElement).findByText('100%')).toBeVisible();
  },
};

export const WithoutCountedUsage: Story = {
  args: {
    quotas: [
      {
        ...CUSTOM_USER_QUOTA,
        consumedValue: null,
        remainingValue: null,
        periodStart: null,
        periodEnd: null,
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.hover(await canvas.findByText('—'));

    const tooltip = await within(canvasElement.ownerDocument.body).findByRole(
      'tooltip',
      {},
      { timeout: 2000 },
    );

    await waitFor(() => expect(tooltip).toHaveTextContent('Limit'));
  },
};
