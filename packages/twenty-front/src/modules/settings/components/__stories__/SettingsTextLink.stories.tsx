import { SettingsTextLink } from '@/settings/components/SettingsTextLink';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof SettingsTextLink> = {
  title: 'Modules/Settings/SettingsTextLink',
  component: SettingsTextLink,
  decorators: [ComponentDecorator],
};
export default meta;
type Story = StoryObj<typeof SettingsTextLink>;

export const External: Story = {
  args: {
    href: 'https://hub.docker.com/r/twentycrm/twenty',
    children: 'v2.64.0',
  },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'v2.64.0' });

    await expect(link).toHaveAttribute(
      'href',
      'https://hub.docker.com/r/twentycrm/twenty',
    );
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  },
};
