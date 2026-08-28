import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { NavigationDrawerCollapseButton } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerCollapseButton';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof NavigationDrawerCollapseButton> = {
  title: 'UI/Navigation/NavigationDrawer/NavigationDrawerCollapseButton',
  decorators: [ComponentDecorator, RouterDecorator],
  component: NavigationDrawerCollapseButton,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const label =
      args.direction === 'right' ? 'Expand sidebar' : 'Collapse sidebar';

    await userEvent.hover(canvas.getByRole('button', { name: label }));

    const tooltip = await within(canvasElement.ownerDocument.body).findByRole(
      'tooltip',
      { name: label },
      { timeout: 2000 },
    );

    await waitFor(() => expect(tooltip).toBeVisible());
  },
};

export default meta;
type Story = StoryObj<typeof NavigationDrawerCollapseButton>;

export const Default: Story = {};

export const Expand: Story = {
  args: { direction: 'right' },
};
