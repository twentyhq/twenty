import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ComponentDecorator } from 'twenty-ui/testing';

import { SettingsBillingLimitUsageSelect } from '@/settings/billing/components/SettingsBillingLimitUsageSelect';
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

const meta: Meta<typeof SettingsBillingLimitUsageSelect> = {
  title: 'Modules/Settings/Billing/SettingsBillingLimitUsageSelect',
  component: SettingsBillingLimitUsageSelect,
  decorators: [ComponentDecorator],
  args: {
    definitions: DEFINITIONS,
    resourceType: null,
    operationType: null,
    onChange: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof SettingsBillingLimitUsageSelect>;

export const Empty: Story = {};

export const Chosen: Story = {
  args: {
    resourceType: UsageResourceType.AI,
    operationType: UsageOperationType.AI_CHAT_TOKEN,
  },
};

export const AllOperations: Story = {
  args: {
    resourceType: UsageResourceType.AI,
    operationType: UsageOperationType.ALL,
  },
};
