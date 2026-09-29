import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
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
