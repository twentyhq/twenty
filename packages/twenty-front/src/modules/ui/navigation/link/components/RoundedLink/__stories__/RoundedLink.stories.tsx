import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { RoundedLink } from '@/ui/navigation/link/components/RoundedLink/RoundedLink';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof RoundedLink> = {
  title: 'UI/Navigation/Link/RoundedLink',
  component: RoundedLink,
  decorators: [ComponentDecorator],
  args: {
    href: '/test',
    label: 'Rounded chip',
  },
};

export default meta;
type Story = StoryObj<typeof RoundedLink>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Rounded chip' });
    const linkStyle = getComputedStyle(link);
    const primaryColor = linkStyle.getPropertyValue('--t-font-color-primary');
    const backgroundColor = linkStyle.getPropertyValue(
      '--t-background-transparent-lighter',
    );

    await expect(link).toHaveStyle({ color: primaryColor });
    await expect(link).toHaveStyle({ 'background-color': backgroundColor });
  },
};

export const Secondary: Story = {
  args: {
    color: 'secondary',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Rounded chip' });
    const secondaryColor = getComputedStyle(link).getPropertyValue(
      '--t-font-color-secondary',
    );

    await expect(link).toHaveStyle({ color: secondaryColor });
  },
};
