import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

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
      operatorOnlyScopes: [],
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
      operatorOnlyScopes: [],
    },
    {
      __typename: 'UsageQuotaDefinition' as const,
      resourceType: UsageResourceType.LOGIC_FUNCTION,
      allowedOperations: [
        {
          __typename: 'UsageLimitOperationDefinition' as const,
          operationType: UsageOperationType.CODE_EXECUTION,
          allowedUnits: [UsageUnit.CREDIT, UsageUnit.INVOCATION],
        },
      ],
      allowedSpenderTypes: ['workspace'],
      operatorOnlyScopes: [],
    },
    {
      __typename: 'UsageQuotaDefinition' as const,
      resourceType: UsageResourceType.EMAIL,
      allowedOperations: [
        {
          __typename: 'UsageLimitOperationDefinition' as const,
          operationType: UsageOperationType.EMAIL_SEND,
          allowedUnits: [UsageUnit.CREDIT, UsageUnit.INVOCATION],
        },
      ],
      allowedSpenderTypes: ['workspace', 'userWorkspace'],
      operatorOnlyScopes: [
        {
          __typename: 'UsageQuotaOperatorOnlyScope' as const,
          operationType: UsageOperationType.EMAIL_SEND,
          spenderType: 'workspace',
          unit: UsageUnit.INVOCATION,
          periodUnit: 'day',
        },
      ],
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

const EMAIL_SEND_VALUES = {
  resourceType: UsageResourceType.EMAIL,
  operationType: UsageOperationType.EMAIL_SEND,
  spenderType: 'workspace' as const,
  spenderId: '',
  unit: UsageUnit.INVOCATION,
  periodUnit: 'month' as const,
  limitValue: '30000',
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

export const EmailsHideTheInstanceDefaultPeriod: Story = {
  args: { values: EMAIL_SEND_VALUES },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      within(canvasElement).getByRole('button', { name: /Month/ }),
    );
    const popup = await body.findByRole('dialog');

    expect(within(popup).getByRole('button', { name: 'Week' })).toBeVisible();
    expect(
      within(popup).queryByRole('button', { name: 'Day' }),
    ).not.toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
  },
};

export const SwitchingToEmailsLeavesTheInstanceDefaultPeriod: Story = {
  args: {
    values: { ...EMAIL_SEND_VALUES, unit: UsageUnit.CREDIT, periodUnit: 'day' },
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      within(canvasElement).getByRole('button', { name: /Credits/ }),
    );
    const popup = await body.findByRole('dialog');

    await userEvent.click(
      within(popup).getByRole('button', { name: 'Emails' }),
    );
    expect(args.onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        unit: UsageUnit.INVOCATION,
        periodUnit: 'week',
      }),
    );
  },
};
