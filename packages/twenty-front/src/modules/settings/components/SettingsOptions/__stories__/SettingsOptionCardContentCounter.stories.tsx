import { SettingsOptionCardContentCounter } from '@/settings/components/SettingsOptions/SettingsOptionCardContentCounter';
import styled from '@emotion/styled';
import { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ComponentDecorator, IconUsers } from 'twenty-ui';

const StyledContainer = styled.div`
  width: 480px;
`;

const CounterWithState = ({
  value: initialValue,
  Icon,
  title,
  description,
  divider,
  disabled,
  minValue,
  maxValue,
  onChange: _onChange,
}: React.ComponentProps<typeof SettingsOptionCardContentCounter>) => {
  const [value, setValue] = useState(initialValue);

  return (
    <StyledContainer>
      <SettingsOptionCardContentCounter
        value={value}
        onChange={setValue}
        Icon={Icon}
        title={title}
        description={description}
        divider={divider}
        disabled={disabled}
        minValue={minValue}
        maxValue={maxValue}
      />
    </StyledContainer>
  );
};

const meta: Meta<typeof SettingsOptionCardContentCounter> = {
  title: 'Modules/Settings/SettingsOptionCardContentCounter',
  component: SettingsOptionCardContentCounter,
  decorators: [ComponentDecorator],
  parameters: {
    maxWidth: 800,
  },
};

export default meta;
type Story = StoryObj<typeof SettingsOptionCardContentCounter>;

export const Default: Story = {
  render: (args) => (
    <CounterWithState
      value={args.value}
      Icon={args.Icon}
      title={args.title}
      description={args.description}
      divider={args.divider}
      disabled={args.disabled}
      minValue={args.minValue}
      maxValue={args.maxValue}
      onChange={args.onChange}
    />
  ),
  args: {
    Icon: IconUsers,
    title: 'Team Members',
    description: 'Set the maximum number of team members',
    value: 5,
    minValue: 1,
    maxValue: 10,
    onChange: () => {},
  },
  argTypes: {
    Icon: { control: false },
    onChange: { control: false },
  },
};

export const WithoutIcon: Story = {
  render: (args) => (
    <CounterWithState
      value={args.value}
      title={args.title}
      description={args.description}
      divider={args.divider}
      disabled={args.disabled}
      minValue={args.minValue}
      maxValue={args.maxValue}
      onChange={args.onChange}
    />
  ),
  args: {
    title: 'Items Per Page',
    description: 'Configure the number of items shown per page',
    value: 20,
    minValue: 10,
    maxValue: 50,
    onChange: () => {},
  },
};

export const Disabled: Story = {
  render: (args) => (
    <CounterWithState
      value={args.value}
      Icon={args.Icon}
      title={args.title}
      description={args.description}
      divider={args.divider}
      disabled={args.disabled}
      minValue={args.minValue}
      maxValue={args.maxValue}
      onChange={args.onChange}
    />
  ),
  args: {
    Icon: IconUsers,
    title: 'Disabled Counter',
    description: 'This counter is currently disabled',
    value: 3,
    disabled: true,
    minValue: 1,
    maxValue: 10,
    onChange: () => {},
  },
};
