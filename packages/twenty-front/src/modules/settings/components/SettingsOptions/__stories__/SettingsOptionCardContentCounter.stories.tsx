import { SettingsOptionCardContentCounter } from '@/settings/components/SettingsOptions/SettingsOptionCardContentCounter';
import styled from '@emotion/styled';
import { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ComponentDecorator, IconUsers } from 'twenty-ui';

const StyledContainer = styled.div`
  width: 480px;
`;

const SettingsOptionCardContentCounterWrapper = (
  args: React.ComponentProps<typeof SettingsOptionCardContentCounter>,
) => {
  const [value, setValue] = useState(args.value);

  return (
    <StyledContainer>
      <SettingsOptionCardContentCounter
        value={value}
        onChange={setValue}
        Icon={args.Icon}
        title={args.title}
        description={args.description}
        disabled={args.disabled}
        minValue={args.minValue}
        maxValue={args.maxValue}
      />
    </StyledContainer>
  );
};

const meta: Meta<typeof SettingsOptionCardContentCounterWrapper> = {
  title: 'Modules/Settings/SettingsOptionCardContentCounter',
  component: SettingsOptionCardContentCounterWrapper,
  decorators: [ComponentDecorator],
  parameters: {
    maxWidth: 800,
  },
};

export default meta;
type Story = StoryObj<typeof SettingsOptionCardContentCounterWrapper>;

export const Default: Story = {
  args: {
    Icon: IconUsers,
    title: 'Team Members',
    description: 'Set the maximum number of team members',
    value: 5,
    minValue: 1,
    maxValue: 10,
  },
  argTypes: {
    Icon: { control: false },
    onChange: { control: false },
  },
};

export const WithoutIcon: Story = {
  args: {
    title: 'Items Per Page',
    description: 'Configure the number of items shown per page',
    value: 20,
    minValue: 10,
    maxValue: 50,
  },
};

export const Disabled: Story = {
  args: {
    Icon: IconUsers,
    title: 'Disabled Counter',
    description: 'This counter is currently disabled',
    value: 3,
    disabled: true,
    minValue: 1,
    maxValue: 10,
  },
};
