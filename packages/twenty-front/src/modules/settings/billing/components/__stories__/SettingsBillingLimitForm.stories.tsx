import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ComponentDecorator } from 'twenty-ui/testing';

import { SettingsBillingLimitForm } from '@/settings/billing/components/SettingsBillingLimitForm';
import { EMPTY_USAGE_LIMIT_FORM_VALUES } from '@/settings/billing/constants/EmptyUsageLimitFormValues';
import {
  UsageOperationType,
  UsageResourceType,
} from '~/generated-metadata/graphql';

const DEFINITIONS = {
  __typename: 'UsageQuotaDefinitions' as const,
  definitions: [
    {
      __typename: 'UsageQuotaDefinition' as const,
      resourceType: UsageResourceType.AI,
      allowedOperationTypes: [
        UsageOperationType.AI_CHAT_TOKEN,
        UsageOperationType.AI_WORKFLOW_TOKEN,
        UsageOperationType.WEB_SEARCH,
      ],
      allowedSpenderTypes: ['workspace', 'userWorkspace', 'apiKey'],
      allowedMeters: ['creditsUsedMicro', 'quantity'],
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
  meter: 'creditsUsedMicro' as const,
  periodUnit: 'month' as const,
  limitValue: '100',
};

const meta: Meta<typeof SettingsBillingLimitForm> = {
  title: 'Modules/Settings/Billing/SettingsBillingLimitForm',
  component: SettingsBillingLimitForm,
  decorators: [ComponentDecorator],
  args: {
    definitions: DEFINITIONS,
    values: EMPTY_USAGE_LIMIT_FORM_VALUES,
    scopeConsumption: null,
    onChange: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof SettingsBillingLimitForm>;

export const Empty: Story = {};

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
