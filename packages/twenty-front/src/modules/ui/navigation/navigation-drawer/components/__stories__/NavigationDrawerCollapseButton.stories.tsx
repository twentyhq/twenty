import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { NavigationDrawerCollapseButton } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerCollapseButton';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof NavigationDrawerCollapseButton> = {
  title: 'UI/Navigation/NavigationDrawer/NavigationDrawerCollapseButton',
  decorators: [ComponentDecorator, RouterDecorator],
  component: NavigationDrawerCollapseButton,
};

export default meta;
type Story = StoryObj<typeof NavigationDrawerCollapseButton>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.hover(
      canvas.getByRole('button', { name: 'Collapse sidebar' }),
    );

    const tooltip = await within(canvasElement.ownerDocument.body).findByRole(
      'tooltip',
      { name: 'Collapse sidebar' },
      { timeout: 2000 },
    );

    await waitFor(() => expect(tooltip).toBeVisible());
  },
};

export const Expand: Story = {
  args: { direction: 'right' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.hover(
      canvas.getByRole('button', { name: 'Expand sidebar' }),
    );

    const tooltip = await within(canvasElement.ownerDocument.body).findByRole(
      'tooltip',
      { name: 'Expand sidebar' },
      { timeout: 2000 },
    );

    await waitFor(() => expect(tooltip).toBeVisible());
  },
};
