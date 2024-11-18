import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import styled from '@emotion/styled';
import { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  ComponentDecorator,
  IconBell,
  IconLock,
  IconRobot,
  IconUsers,
} from 'twenty-ui';

const StyledContainer = styled.div`
  width: 480px;
`;

const ToggleWithState = ({
  checked: initialChecked,
  Icon,
  title,
  description,
  divider,
  disabled,
  advancedMode,
  onChange: _onChange,
}: React.ComponentProps<typeof SettingsOptionCardContentToggle>) => {
  const [checked, setChecked] = useState(initialChecked);

  return (
    <StyledContainer>
      <SettingsOptionCardContentToggle
        checked={checked}
        onChange={setChecked}
        Icon={Icon}
        title={title}
        description={description}
        divider={divider}
        disabled={disabled}
        advancedMode={advancedMode}
      />
    </StyledContainer>
  );
};

const meta: Meta<typeof SettingsOptionCardContentToggle> = {
  title: 'Modules/Settings/SettingsOptionCardContentToggle',
  component: SettingsOptionCardContentToggle,
  decorators: [ComponentDecorator],
  parameters: {
    maxWidth: 800,
  },
};

export default meta;
type Story = StoryObj<typeof SettingsOptionCardContentToggle>;

export const Default: Story = {
  render: (args) => (
    <ToggleWithState
      checked={args.checked}
      Icon={args.Icon}
      title={args.title}
      description={args.description}
      divider={args.divider}
      disabled={args.disabled}
      advancedMode={args.advancedMode}
      onChange={args.onChange}
    />
  ),
  args: {
    Icon: IconBell,
    title: 'Notifications',
    description: 'Receive notifications about important updates',
    checked: true,
    onChange: () => {},
  },
  argTypes: {
    Icon: { control: false },
    onChange: { control: false },
  },
};

export const Disabled: Story = {
  render: (args) => (
    <ToggleWithState
      checked={args.checked}
      Icon={args.Icon}
      title={args.title}
      description={args.description}
      divider={args.divider}
      disabled={args.disabled}
      advancedMode={args.advancedMode}
      onChange={args.onChange}
    />
  ),
  args: {
    Icon: IconLock,
    title: 'Locked Setting',
    description: 'This setting is currently unavailable',
    checked: false,
    disabled: true,
    onChange: () => {},
  },
};

export const AdvancedMode: Story = {
  render: (args) => (
    <ToggleWithState
      checked={args.checked}
      Icon={args.Icon}
      title={args.title}
      description={args.description}
      divider={args.divider}
      disabled={args.disabled}
      advancedMode={args.advancedMode}
      onChange={args.onChange}
    />
  ),
  args: {
    Icon: IconRobot,
    title: 'Advanced Features',
    description: 'Enable experimental features',
    checked: true,
    advancedMode: true,
    onChange: () => {},
  },
};

export const WithoutIcon: Story = {
  render: (args) => (
    <ToggleWithState
      checked={args.checked}
      Icon={args.Icon}
      title={args.title}
      description={args.description}
      divider={args.divider}
      disabled={args.disabled}
      advancedMode={args.advancedMode}
      onChange={args.onChange}
    />
  ),
  args: {
    title: 'Simple Toggle',
    description: 'A basic toggle without an icon',
    checked: true,
    onChange: () => {},
  },
};

export const WithoutDescription: Story = {
  render: (args) => (
    <ToggleWithState
      checked={args.checked}
      Icon={args.Icon}
      title={args.title}
      description={args.description}
      divider={args.divider}
      disabled={args.disabled}
      advancedMode={args.advancedMode}
      onChange={args.onChange}
    />
  ),
  args: {
    Icon: IconUsers,
    title: 'Team Access',
    checked: false,
    onChange: () => {},
  },
};
