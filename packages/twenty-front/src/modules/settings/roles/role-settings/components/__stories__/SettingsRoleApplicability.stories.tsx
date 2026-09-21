import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { SettingsRoleApplicability } from '@/settings/roles/role-settings/components/SettingsRoleApplicability';

const meta: Meta<typeof SettingsRoleApplicability> = {
  title: 'Modules/Settings/Roles/SettingsRoleApplicability',
  component: SettingsRoleApplicability,
  args: {
    values: {
      canBeAssignedToUsers: false,
      canBeAssignedToAgents: false,
      canBeAssignedToApiKeys: false,
    },
    isEditable: true,
    onApplicabilityChange: fn(),
  },
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof SettingsRoleApplicability>;

export const Selection: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', {
      name: 'Assignable to Agents',
    });
    await userEvent.click(checkbox);
    await expect(args.onApplicabilityChange).toHaveBeenCalledTimes(1);
    await expect(args.onApplicabilityChange).toHaveBeenLastCalledWith(
      'canBeAssignedToAgents',
      true,
    );
    await userEvent.keyboard('[Space]');
    await expect(args.onApplicabilityChange).toHaveBeenCalledTimes(2);
    await expect(args.onApplicabilityChange).toHaveBeenLastCalledWith(
      'canBeAssignedToAgents',
      true,
    );
    await userEvent.click(canvas.getByText('Assignable to Agents'));
    await expect(args.onApplicabilityChange).toHaveBeenCalledTimes(3);
    await expect(args.onApplicabilityChange).toHaveBeenLastCalledWith(
      'canBeAssignedToAgents',
      true,
    );
  },
};

export const Disabled: Story = {
  args: { isEditable: false },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('checkbox', { name: 'Assignable to Agents' }),
    );
    await userEvent.click(canvas.getByText('Assignable to Agents'));
    await expect(args.onApplicabilityChange).not.toHaveBeenCalled();
  },
};
