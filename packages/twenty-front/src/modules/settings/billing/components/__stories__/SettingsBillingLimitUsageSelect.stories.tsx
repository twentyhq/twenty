import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { SettingsBillingLimitUsageSelect } from '@/settings/billing/components/SettingsBillingLimitUsageSelect';
import {
  UsageOperationType,
  UsageResourceType,
  UsageUnit,
} from '~/generated-metadata/graphql';

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

export const AllOperationsFromServer: Story = {
  args: {
    resourceType: UsageResourceType.AI,
    operationType: UsageOperationType.AI_CHAT_TOKEN,
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(within(canvasElement).getByRole('button'));
    const popup = await body.findByRole('dialog', { name: 'Usage' });

    await userEvent.click(within(popup).getByRole('button', { name: 'AI' }));
    expect(
      await within(popup).findByRole('button', { name: 'All operations' }),
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');
  },
};

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

export const NavigateAndSelect: Story = {
  args: {
    resourceType: UsageResourceType.AI,
    operationType: UsageOperationType.AI_CHAT_TOKEN,
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = within(canvasElement).getByRole('button');

    await userEvent.click(trigger);
    const popup = await body.findByRole('dialog', { name: 'Usage' });

    await userEvent.click(within(popup).getByRole('button', { name: 'AI' }));
    expect(
      await within(popup).findByRole('button', {
        name: 'Chats',
        pressed: true,
      }),
    ).toBeVisible();
    await userEvent.click(within(popup).getByRole('button', { name: 'AI' }));
    await waitFor(() =>
      expect(within(popup).getByRole('button', { name: 'AI' })).toHaveFocus(),
    );

    await userEvent.keyboard('{Enter}');
    await userEvent.click(
      await within(popup).findByRole('button', { name: 'Web Search' }),
    );
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    expect(args.onChange).toHaveBeenCalledWith({
      resourceType: UsageResourceType.AI,
      operationType: UsageOperationType.WEB_SEARCH,
    });

    await userEvent.click(trigger);
    expect(await body.findByRole('button', { name: 'AI' })).toBeVisible();
    expect(
      body.queryByRole('button', { name: 'Web Search' }),
    ).not.toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
  },
};
