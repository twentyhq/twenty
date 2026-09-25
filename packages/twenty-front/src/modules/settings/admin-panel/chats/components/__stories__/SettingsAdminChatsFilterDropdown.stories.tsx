import { SettingsAdminChatsFilterDropdown } from '@/settings/admin-panel/chats/components/SettingsAdminChatsFilterDropdown';
import { type AdminChatsFilterState } from '@/settings/admin-panel/chats/types/AdminChatsFilterState';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';

const FilterExample = () => {
  const [filters, setFilters] = useState<AdminChatsFilterState>({
    onboardingOnly: false,
    hasErrorOnly: false,
    userNeverEngagedOnly: false,
  });
  return (
    <SettingsAdminChatsFilterDropdown
      filterButton={<Button>Filter chats</Button>}
      filters={filters}
      onFiltersChange={setFilters}
    />
  );
};

const meta: Meta = {
  title: 'Modules/Settings/AdminPanel/Chats/Filters',
  decorators: [ComponentDecorator],
  render: () => <FilterExample />,
};
export default meta;
type Story = StoryObj;

export const ToggleWithoutClosing: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Filter chats',
    });
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(trigger);
    const popup = await body.findByRole('dialog');
    const switches = within(popup).getAllByRole('switch');
    await userEvent.click(switches[0]);
    expect(switches[0]).toBeChecked();
    expect(popup).toBeVisible();
    await userEvent.tab();
    await userEvent.keyboard(' ');
    expect(switches[1]).toBeChecked();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(trigger);
    const reopened = await body.findByRole('dialog');
    expect(within(reopened).getAllByRole('switch')[0]).toBeChecked();
    await userEvent.keyboard('{Escape}');
  },
};
