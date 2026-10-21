import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from 'twenty-ui/primitives/input';
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
        onChange={(nextChecked) => {
          setChecked(nextChecked);
          args.onChange?.(nextChecked);
        }}
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

const LONG_DESCRIPTION =
  'Receive notifications about important updates, upcoming workspace changes and activity from every team you follow, including updates that require your attention.';

export const Default: Story = {
  args: {
    Icon: IconBell,
    title: 'Notifications',
    description: LONG_DESCRIPTION,
    checked: true,
  },
  argTypes: {
    Icon: { control: false },
    onChange: { control: false },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('switch', { name: 'Notifications' });
    const description = canvas.getByText(LONG_DESCRIPTION);

    await expect(control).toBeChecked();
    await expect(control).toHaveAccessibleDescription(LONG_DESCRIPTION);
    await expect(description.clientWidth).toBeGreaterThan(0);
    await expect(description.scrollWidth).toBeGreaterThan(
      description.clientWidth,
    );
    await expect(description).toHaveStyle({
      display: 'block',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    });
    await userEvent.click(canvas.getByText('Notifications'));
    await expect(control).not.toBeChecked();
    control.focus();
    await userEvent.keyboard(' ');
    await expect(control).toBeChecked();
    await expect(control).toHaveFocus();

    await userEvent.hover(description);
    await expect(
      await within(canvasElement.ownerDocument.body).findByRole('tooltip'),
    ).toHaveTextContent(LONG_DESCRIPTION);
    await userEvent.click(description);
    await expect(control).not.toBeChecked();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

export const Disabled: Story = {
  tags: ['!dev'],
  args: {
    Icon: IconLock,
    title: 'Locked Setting',
    description: 'This setting is currently unavailable',
    checked: false,
    disabled: true,
    onChange: fn(),
  },
  render: (args) => (
    <StyledContainer>
      <Button>Before disabled setting</Button>
      <SettingsOptionCardContentSwitchWrapper
        checked={args.checked}
        onChange={args.onChange}
        Icon={args.Icon}
        title={args.title}
        description={args.description}
        divider={args.divider}
        disabled={args.disabled}
      />
      <Button>After disabled setting</Button>
    </StyledContainer>
  ),
  play: async ({ canvasElement, args }) => {
    const { userEvent: trustedUserEvent } = await import('vitest/browser');
    const canvas = within(canvasElement);
    const control = canvas.getByRole('switch', { name: 'Locked Setting' });

    for (const target of [
      canvas.getByText('Locked Setting'),
      canvas.getByText('This setting is currently unavailable'),
      control,
    ]) {
      await userEvent.click(target);
      await expect(control).not.toBeChecked();
    }

    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(control).toHaveAttribute('aria-disabled', 'true');
    await expect(control).toHaveAttribute('tabindex', '-1');
    await trustedUserEvent.click(
      canvas.getByRole('button', { name: 'Before disabled setting' }),
    );
    await trustedUserEvent.tab();
    await expect(
      canvas.getByRole('button', { name: 'After disabled setting' }),
    ).toHaveFocus();
    await expect(control).not.toHaveFocus();
    await expect(args.onChange).not.toHaveBeenCalled();
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
