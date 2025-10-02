import { SettingsOptionCardContentInput } from '@/settings/components/SettingsOptions/SettingsOptionCardContentInput';
import styled from '@emotion/styled';
import { type Meta, type StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui/testing';
import { IconTrash, IconCalendar, IconDatabase } from 'twenty-ui/display';

const StyledContainer = styled.div`
  width: 480px;
`;

const SettingsOptionCardContentInputWrapper = (
  args: React.ComponentProps<typeof SettingsOptionCardContentInput>,
) => {
  const handleBlur = (value: string) => {
    console.log('Value on blur:', value);
  };

  return (
    <StyledContainer>
      <SettingsOptionCardContentInput
        Icon={args.Icon}
        title={args.title}
        description={args.description}
        value={args.value}
        onBlur={handleBlur}
        disabled={args.disabled}
        placeholder={args.placeholder}
      />
    </StyledContainer>
  );
};

const meta: Meta<typeof SettingsOptionCardContentInputWrapper> = {
  title: 'Modules/Settings/SettingsOptionCardContentInput',
  component: SettingsOptionCardContentInputWrapper,
  decorators: [ComponentDecorator],
  parameters: {
    maxWidth: 800,
  },
};

export default meta;
type Story = StoryObj<typeof SettingsOptionCardContentInputWrapper>;

export const Default: Story = {
  args: {
    Icon: IconTrash,
    title: 'Erasure of soft-deleted records',
    description: 'Permanent deletion. Enter the number of days.',
    value: '14',
    placeholder: '14',
  },
  argTypes: {
    Icon: { control: false },
    onBlur: { control: false },
  },
};

export const Disabled: Story = {
  args: {
    Icon: IconDatabase,
    title: 'Database Retention',
    description: 'This setting is currently locked',
    value: '30',
    disabled: true,
  },
};

export const WithoutIcon: Story = {
  args: {
    title: 'Simple Input',
    description: 'A basic input without an icon',
    value: '7',
    placeholder: '0',
  },
};

export const WithoutDescription: Story = {
  args: {
    Icon: IconCalendar,
    title: 'Days to Keep',
    value: '90',
  },
};
