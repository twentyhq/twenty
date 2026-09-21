import { SettingsListItemCardContent } from '@/settings/components/SettingsListItemCardContent';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';

const meta: Meta<typeof SettingsListItemCardContent> = {
  title: 'Modules/Settings/SettingsListItemCardContent',
  component: SettingsListItemCardContent,
  args: {
    label: 'Callback row',
    onClick: fn(),
    rightComponent: null,
  },
};

export default meta;
type Story = StoryObj<typeof SettingsListItemCardContent>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    expect(
      (await within(canvasElement).findByText('Callback row')).closest(
        '[data-clickable]',
      ),
    ).toHaveAttribute('data-hover-highlight', 'true');
  },
};
