import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import styled from '@emotion/styled';
import { type Meta, type StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ComponentDecorator } from 'twenty-ui/testing';
import { IconBell, IconLock, IconRobot, IconUsers } from 'twenty-ui/display';

const StyledContainer = styled.div`
  width: 480px;
`;

const SettingsOptionCardContentToggleWrapper = (
  args: React.ComponentProps<typeof SettingsOptionCardContentToggle>,
) => {
  const [checked, setChecked] = useState(args.checked);

  return (
    <StyledContainer>
      <SettingsOptionCardContentToggle
        checked={checked}
        onChange={setChecked}
        Icon={args.Icon}
        title={args.title}
        description={args.description}
        divider={args.divider}
        disabled={args.disabled}
        advancedMode={args.advancedMode}
      />
    </StyledContainer>
  );
};

const meta: Meta<typeof SettingsOptionCardContentToggleWrapper> = {
  title: 'Modules/Settings/SettingsOptionCardContentToggle',
  component: SettingsOptionCardContentToggleWrapper,
  decorators: [ComponentDecorator],
  parameters: {
    maxWidth: 800,
  },
};

export default meta;
type Story = StoryObj<typeof SettingsOptionCardContentToggleWrapper>;

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
};

export const Disabled: Story = {
  args: {
    Icon: IconLock,
    title: 'Locked Setting',
    description: 'This setting is currently unavailable',
    checked: false,
    disabled: true,
  },
};

export const AdvancedMode: Story = {
  args: {
    Icon: IconRobot,
    title: 'Advanced Features',
    description: 'Enable experimental features',
    checked: true,
    advancedMode: true,
  },
};

export const WithoutIcon: Story = {
  args: {
    title: 'Simple Toggle',
    description: 'A basic toggle without an icon',
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
