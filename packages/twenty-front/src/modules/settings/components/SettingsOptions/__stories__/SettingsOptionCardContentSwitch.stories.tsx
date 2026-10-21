import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { IconBell, IconLock, IconUsers } from 'twenty-ui/icon';
import { ComponentDecorator } from 'twenty-ui/testing';

const StyledContainer = styled.div`
  width: 480px;
`;

const SettingsOptionCardContentSwitchWrapper = (
  args: React.ComponentProps<typeof SettingsOptionCardContentSwitch>,
) => {
  const [checked, setChecked] = useState(args.checked);

  return (
    <StyledContainer>
      <SettingsOptionCardContentSwitch
        checked={checked}
        onChange={setChecked}
        Icon={args.Icon}
        title={args.title}
        description={args.description}
        divider={args.divider}
        disabled={args.disabled}
      />
    </StyledContainer>
  );
};

const meta: Meta<typeof SettingsOptionCardContentSwitchWrapper> = {
  title: 'Modules/Settings/SettingsOptionCardContentSwitch',
  component: SettingsOptionCardContentSwitchWrapper,
  decorators: [ComponentDecorator],
  parameters: {
    maxWidth: 800,
  },
};

export default meta;
type Story = StoryObj<typeof SettingsOptionCardContentSwitchWrapper>;

export const Default: Story = {
  args: {
    Icon: IconBell,
    title: 'Notifications',
    description: 'Receive notifications about important updates',
    checked: true,
  },
  argTypes: {
    Icon: { control: false },
    onChange: { control: false },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('switch', { name: 'Notifications' });

    await expect(control).toBeChecked();
    await userEvent.click(canvas.getByText('Notifications'));
    await expect(control).not.toBeChecked();
    control.focus();
    await userEvent.keyboard(' ');
    await expect(control).toBeChecked();
    await expect(control).toHaveFocus();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

export const Disabled: Story = {
  args: {
    Icon: IconLock,
    title: 'Locked Setting',
    description: 'This setting is currently unavailable',
    checked: false,
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('switch', { name: 'Locked Setting' });

    await userEvent.click(canvas.getByText('Locked Setting'));
    await expect(control).not.toBeChecked();
    await expect(control).toHaveAttribute('aria-disabled', 'true');
    control.focus();
    await expect(control).not.toHaveFocus();
  },
};

export const WithoutIcon: Story = {
  args: {
    title: 'Simple Switch',
    description: 'A basic switch without an icon',
    checked: true,
  },
};

export const WithoutDescription: Story = {
  args: {
    Icon: IconUsers,
    title: 'Team Access',
    checked: false,
  },
};
