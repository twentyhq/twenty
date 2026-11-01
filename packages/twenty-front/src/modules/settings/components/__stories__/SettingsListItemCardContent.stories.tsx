import { SettingsListItemCardContent } from '@/settings/components/SettingsListItemCardContent';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';

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
  play: async ({ canvasElement, args }) => {
    const action = within(canvasElement).getByRole('button', {
      name: 'Callback row',
    });

    action.focus();
    await userEvent.keyboard('{Enter} ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
    await expect(action).toHaveStyle({
      position: 'absolute',
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineOffset: '-2px',
    });
  },
};

export const DisplayRow: Story = {
  args: { onClick: undefined, label: 'Display row' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Display row')).toBeVisible();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
    await expect(canvas.queryByRole('link')).not.toBeInTheDocument();
  },
};

export const LinkWithIndependentControl: Story = {
  args: { label: 'Domain settings', to: '/card-detail' },
  render: (args) => (
    <MemoryRouter>
      <SettingsListItemCardContent
        {...args}
        rightComponent={<Button>More options</Button>}
      />
      <Routes>
        <Route path="/" element={null} />
        <Route
          path="/card-detail"
          element={<Text>Domain settings opened</Text>}
        />
      </Routes>
    </MemoryRouter>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Domain settings' });
    const control = canvas.getByRole('button', { name: 'More options' });

    await expect(link).toHaveAttribute('href', '/card-detail');
    await expect(link).not.toContainElement(control);
    await userEvent.click(control);
    await expect(args.onClick).not.toHaveBeenCalled();
    await expect(
      canvas.queryByText('Domain settings opened'),
    ).not.toBeInTheDocument();
    link.focus();
    await userEvent.keyboard('{Enter}');
    await expect(
      await canvas.findByText('Domain settings opened'),
    ).toBeVisible();
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
