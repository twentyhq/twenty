import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { SettingsBillingLimitForm } from '@/settings/billing/components/SettingsBillingLimitForm';
import { EMPTY_USAGE_LIMIT_FORM_VALUES } from '@/settings/billing/constants/EmptyUsageLimitFormValues';
import {
  UsageOperationType,
  UsageResourceType,
  UsageUnit,
} from '~/generated-metadata/graphql';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';

const DEFINITIONS = {
  __typename: 'UsageQuotaDefinitions' as const,
  definitions: [
    {
      __typename: 'UsageQuotaDefinition' as const,
      resourceType: UsageResourceType.AI,
      allowedOperations: [
        {
          __typename: 'UsageLimitOperationDefinition' as const,
          operationType: UsageOperationType.ALL,
          allowedUnits: [UsageUnit.CREDIT],
        },
        {
          __typename: 'UsageLimitOperationDefinition' as const,
          operationType: UsageOperationType.AI_CHAT_TOKEN,
          allowedUnits: [UsageUnit.CREDIT, UsageUnit.TOKEN],
        },
        {
          __typename: 'UsageLimitOperationDefinition' as const,
          operationType: UsageOperationType.AI_WORKFLOW_TOKEN,
          allowedUnits: [UsageUnit.CREDIT, UsageUnit.TOKEN],
        },
        {
          __typename: 'UsageLimitOperationDefinition' as const,
          operationType: UsageOperationType.WEB_SEARCH,
          allowedUnits: [UsageUnit.CREDIT, UsageUnit.INVOCATION],
        },
      ],
      allowedSpenderTypes: ['workspace', 'userWorkspace', 'apiKey'],
    },
    {
      __typename: 'UsageQuotaDefinition' as const,
      resourceType: UsageResourceType.WORKFLOW,
      allowedOperations: [
        {
          __typename: 'UsageLimitOperationDefinition' as const,
          operationType: UsageOperationType.WORKFLOW_EXECUTION,
          allowedUnits: [UsageUnit.CREDIT, UsageUnit.INVOCATION],
        },
      ],
      allowedSpenderTypes: ['workspace'],
    },
    {
      __typename: 'UsageQuotaDefinition' as const,
      resourceType: UsageResourceType.LOGIC_FUNCTION,
      allowedOperations: [
        {
          __typename: 'UsageLimitOperationDefinition' as const,
          operationType: UsageOperationType.CODE_EXECUTION,
          allowedUnits: [
            UsageUnit.CREDIT,
            UsageUnit.INVOCATION,
            UsageUnit.MILLISECOND,
          ],
        },
      ],
      allowedSpenderTypes: ['workspace'],
    },
  ],
  isIntraWorkspaceLimitEntitled: true,
  hasAllowancePeriod: true,
};

const FILLED_VALUES = {
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.AI_CHAT_TOKEN,
  spenderType: 'workspace' as const,
  spenderId: '',
  unit: UsageUnit.CREDIT,
  periodUnit: 'month' as const,
  limitValue: '100',
};

const CODE_EXECUTION_VALUES = {
  ...FILLED_VALUES,
  resourceType: UsageResourceType.LOGIC_FUNCTION,
  operationType: UsageOperationType.CODE_EXECUTION,
};

const meta: Meta<typeof SettingsBillingLimitForm> = {
  title: 'Modules/Settings/Billing/SettingsBillingLimitForm',
  component: SettingsBillingLimitForm,
  decorators: [ComponentWithRouterDecorator],
  args: {
    definitions: DEFINITIONS,
    values: EMPTY_USAGE_LIMIT_FORM_VALUES,
    scopeConsumption: null,
    onChange: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof SettingsBillingLimitForm>;

export const Empty: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      canvas.getByRole('button', { name: /Choose a usage/ }),
    ).toHaveAttribute('aria-haspopup', 'dialog');
    expect(canvas.getByText('Workspace · Workspace')).toBeVisible();
    expect(
      canvas.queryByRole('button', { name: /Workspace · Workspace/ }),
    ).not.toBeInTheDocument();
  },
};

export const Filled: Story = {
  args: { values: FILLED_VALUES },
};

export const WithConsumption: Story = {
  args: {
    values: FILLED_VALUES,
    scopeConsumption: {
      consumedValue: 62_000_000,
      periodStart: '2026-09-01T00:00:00.000Z',
      periodEnd: '2026-10-01T00:00:00.000Z',
    },
  },
};

export const AllOperations: Story = {
  args: {
    values: {
      ...FILLED_VALUES,
      operationType: UsageOperationType.ALL,
      periodUnit: 'allowancePeriod',
      limitValue: '1000',
    },
  },
};

export const RuntimeLimit: Story = {
  args: {
    values: {
      ...CODE_EXECUTION_VALUES,
      unit: UsageUnit.MILLISECOND,
      limitValue: '1.5',
    },
    scopeConsumption: {
      consumedValue: 45_000,
      periodStart: '2026-09-01T00:00:00.000Z',
      periodEnd: '2026-10-01T00:00:00.000Z',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.getByText('Minutes')).toBeVisible();
    expect(
      canvas.getByText(/checked when a run starts and counted when it ends/),
    ).toBeVisible();
  },
};
