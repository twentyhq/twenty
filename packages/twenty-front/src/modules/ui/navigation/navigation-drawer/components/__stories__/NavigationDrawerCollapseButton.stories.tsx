import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

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
      canvas.getByRole('button', { name: 'Collapse navigation drawer' }),
    );

    expect(
      await within(canvasElement.ownerDocument.body).findByRole(
        'tooltip',
        { name: 'Collapse navigation drawer' },
        { timeout: 2000 },
      ),
    ).toBeVisible();
  },
};

export const Expand: Story = {
  args: { direction: 'right' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.hover(
      canvas.getByRole('button', { name: 'Expand navigation drawer' }),
    );

    expect(
      await within(canvasElement.ownerDocument.body).findByRole(
        'tooltip',
        { name: 'Expand navigation drawer' },
        { timeout: 2000 },
      ),
    ).toBeVisible();
  },
};
