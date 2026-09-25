import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { SettingsObjectFieldInactiveActionDropdown } from '@/settings/data-model/object-details/components/SettingsObjectFieldDisabledActionDropdown';
import { TableRow } from '@/ui/layout/table/components/TableRow';

const onRowClick = fn();

const meta: Meta<typeof SettingsObjectFieldInactiveActionDropdown> = {
  title: 'Modules/Settings/DataModel/SettingsObjectFieldInactiveActionDropdown',
  component: SettingsObjectFieldInactiveActionDropdown,
  decorators: [ComponentDecorator],
  args: {
    fieldMetadataItemId: 'inactive-custom-field',
    isCustomField: true,
    onActivate: fn(),
    onEdit: fn(),
    onDelete: fn(),
  },
  beforeEach: () => {
    onRowClick.mockClear();
  },
};

export default meta;
type Story = StoryObj<typeof SettingsObjectFieldInactiveActionDropdown>;

export const ActivateWhilePending: Story = {
  args: {
    onActivate: fn(() => new Promise<void>(() => {})),
  },
  render: (args) => (
    <TableRow onClick={onRowClick}>
      <SettingsObjectFieldInactiveActionDropdown {...args} />
    </TableRow>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', {
      name: 'Inactive Field Options',
    });

    await userEvent.click(trigger);

    await expect(
      canvas.getAllByRole('menuitem').map((item) => item.textContent),
    ).toEqual(['Edit', 'Activate', 'Delete']);

    await userEvent.click(canvas.getByRole('menuitem', { name: 'Activate' }));

    await expect(args.onActivate).toHaveBeenCalledTimes(1);
    await expect(onRowClick).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(canvas.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const ReadOnly: Story = {
  args: { readonly: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Inactive Field Options' }),
    );

    await expect(
      canvas.getAllByRole('menuitem').map((item) => item.textContent),
    ).toEqual(['View']);
  },
};

export const SystemField: Story = {
  args: { isSystemField: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Inactive Field Options' }),
    );

    await expect(
      canvas.getAllByRole('menuitem').map((item) => item.textContent),
    ).toEqual(['Edit', 'Activate']);
  },
};
