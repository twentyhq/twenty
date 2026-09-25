import { SettingsBillingLimitsFilterDropdown } from '@/settings/billing/components/SettingsBillingLimitsFilterDropdown';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';
import { UsageResourceType } from '~/generated-metadata/graphql';

const FilterExample = () => {
  const [resource, setResource] = useState<UsageResourceType | null>(null);
  const [spender, setSpender] = useState<string | null>(null);
  return (
    <SettingsBillingLimitsFilterDropdown
      filterButton={<Button>Filter limits</Button>}
      resourceTypes={[UsageResourceType.AI]}
      spenderTypes={['workspace', 'userWorkspace']}
      selectedResourceType={resource}
      selectedSpenderType={spender}
      onSelectResourceType={setResource}
      onSelectSpenderType={setSpender}
    />
  );
};

const meta: Meta = {
  title: 'Modules/Settings/Billing/LimitsFilter',
  decorators: [ComponentDecorator],
  render: () => <FilterExample />,
};
export default meta;
type Story = StoryObj;

export const PagesRetainChoicesAndReset: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Filter limits',
    });
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(trigger);
    const popup = await body.findByRole('dialog');
    await userEvent.click(within(popup).getByRole('button', { name: /Usage/ }));
    await userEvent.click(
      await within(popup).findByRole('button', { name: 'AI' }),
    );
    expect(within(popup).getByRole('button', { name: 'AI' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(popup).toBeVisible();
    await userEvent.click(within(popup).getByRole('button', { name: 'Usage' }));
    const usage = await within(popup).findByRole('button', {
      name: /Usage.*AI/,
    });
    await waitFor(() => expect(usage).toHaveFocus());
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await userEvent.click(
      await within(popup).findByRole('button', { name: 'Workspace' }),
    );
    expect(popup).toBeVisible();
    await userEvent.click(
      within(popup).getByRole('button', { name: 'Spender' }),
    );
    await userEvent.click(
      await within(popup).findByRole('button', { name: 'Clear filters' }),
    );
    expect(popup).toBeVisible();
    expect(
      within(popup).queryByRole('button', { name: 'Clear filters' }),
    ).not.toBeInTheDocument();
    await userEvent.click(within(popup).getByRole('button', { name: /Usage/ }));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    await userEvent.click(trigger);
    expect(await body.findByRole('button', { name: /Spender/ })).toBeVisible();
    await userEvent.keyboard('{Escape}');
  },
};
