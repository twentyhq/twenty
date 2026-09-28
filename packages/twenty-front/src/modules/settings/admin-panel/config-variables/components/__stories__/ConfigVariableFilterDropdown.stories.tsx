import { isConfigVariablesInDbEnabledState } from '@/client-config/states/isConfigVariablesInDbEnabledState';
import { ConfigVariableFilterDropdown } from '@/settings/admin-panel/config-variables/components/ConfigVariableFilterDropdown';
import { type ConfigVariableGroupFilter } from '@/settings/admin-panel/config-variables/types/ConfigVariableGroupFilter';
import { type ConfigVariableSourceFilter } from '@/settings/admin-panel/config-variables/types/ConfigVariableSourceFilter';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

const FilterExample = () => {
  const [sourceFilter, setSourceFilter] =
    useState<ConfigVariableSourceFilter>('all');
  const [groupFilter, setGroupFilter] =
    useState<ConfigVariableGroupFilter>('all');
  const [showHiddenGroupVariables, setShowHiddenGroupVariables] =
    useState(false);

  return (
    <>
      <ConfigVariableFilterDropdown
        sourceFilter={sourceFilter}
        groupFilter={groupFilter}
        groupOptions={[
          { value: 'all', label: 'All Groups' },
          { value: 'server-config', label: 'Server Config' },
        ]}
        showHiddenGroupVariables={showHiddenGroupVariables}
        onSourceFilterChange={setSourceFilter}
        onGroupFilterChange={setGroupFilter}
        onShowHiddenChange={setShowHiddenGroupVariables}
      />
      <p>{`Source: ${sourceFilter}, group: ${groupFilter}`}</p>
    </>
  );
};

const meta: Meta = {
  title: 'Modules/Settings/AdminPanel/ConfigVariables/FilterDropdown',
  decorators: [ComponentDecorator],
  render: () => <FilterExample />,
};
export default meta;
type Story = StoryObj;

export const PagesReturnToRootAfterSelection: Story = {
  beforeEach: () => {
    jotaiStore.set(isConfigVariablesInDbEnabledState.atom, true);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Options' });

    await userEvent.click(trigger);
    const popup = await body.findByRole('dialog', { name: 'Options' });

    await userEvent.click(
      within(popup).getByRole('button', { name: 'Source' }),
    );
    await userEvent.click(
      await within(popup).findByRole('button', { name: 'Database' }),
    );
    expect(
      await canvas.findByText('Source: database, group: all'),
    ).toBeVisible();
    expect(popup).toBeVisible();
    await waitFor(() =>
      expect(
        within(popup).getByRole('button', { name: 'Source' }),
      ).toHaveFocus(),
    );

    await userEvent.click(within(popup).getByRole('button', { name: 'Group' }));
    expect(
      await within(popup).findByRole('button', { name: 'Select Group' }),
    ).toBeVisible();
    await userEvent.click(
      within(popup).getByRole('button', { name: 'Server Config' }),
    );
    expect(
      await canvas.findByText('Source: database, group: server-config'),
    ).toBeVisible();

    await userEvent.click(
      within(popup).getByRole('button', { name: 'Show hidden groups' }),
    );
    expect(
      await within(popup).findByRole('button', { name: 'Hide hidden groups' }),
    ).toBeVisible();

    await userEvent.click(within(popup).getByRole('button', { name: 'Group' }));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());

    await userEvent.click(trigger);
    expect(await body.findByRole('button', { name: 'Source' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
  },
};

export const DatabaseSourceHiddenWhenDisabled: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Options' }),
    );
    await userEvent.click(await body.findByRole('button', { name: 'Source' }));

    expect(
      await body.findByRole('button', { name: 'Environment' }),
    ).toBeVisible();
    expect(
      body.queryByRole('button', { name: 'Database' }),
    ).not.toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
  },
};
