import { SidePanelObjectFilterDropdown } from '@/side-panel/components/SidePanelObjectFilterDropdown';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';

const FilterExample = () => {
  const [object, setObject] = useState<string | null>(null);
  return (
    <SidePanelObjectFilterDropdown
      selectedObjectNameSingular={object}
      onSelectObject={setObject}
    />
  );
};

const meta: Meta = {
  title: 'Modules/SidePanel/ObjectFilter',
  decorators: [ObjectMetadataItemsDecorator, ComponentDecorator],
  render: () => <FilterExample />,
};
export default meta;
type Story = StoryObj;

export const SearchAndHiddenObjects: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await within(canvasElement).findByRole('button', {
      name: 'Filter by object type',
    });
    await userEvent.click(trigger);
    const popup = await body.findByRole('dialog');
    const hiddenSwitch = within(popup).getByRole('switch');
    await userEvent.click(hiddenSwitch);
    expect(hiddenSwitch).toBeChecked();
    expect(popup).toBeVisible();
    await userEvent.type(
      within(popup).getByRole('searchbox', { name: 'Search' }),
      'compan',
    );
    const companies = await within(popup).findByRole('button', {
      name: 'Companies',
    });
    expect(
      within(popup).queryByRole('button', { name: 'All objects' }),
    ).not.toBeInTheDocument();
    await waitFor(() => expect(companies).toHaveAttribute('data-highlighted'));
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    await userEvent.click(trigger);
    const reopened = await body.findByRole('dialog');
    const reopenedSearch = within(reopened).getByRole('searchbox', {
      name: 'Search',
    });
    expect(reopenedSearch).toHaveValue('');
    expect(
      within(reopened).getByRole('button', { name: 'Companies' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await userEvent.type(reopenedSearch, 'all');
    await waitFor(() =>
      expect(
        within(reopened).getByRole('button', { name: 'All objects' }),
      ).toHaveAttribute('data-highlighted'),
    );
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(reopened).not.toBeInTheDocument());
  },
};
