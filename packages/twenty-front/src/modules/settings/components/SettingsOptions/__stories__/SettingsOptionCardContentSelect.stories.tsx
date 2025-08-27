import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { Select } from '@/ui/input/components/Select';
import { type SelectValue } from '@/ui/input/components/internal/select/types';
import styled from '@emotion/styled';
import { type Meta, type StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  IconLanguage,
  IconLayoutKanban,
  IconList,
  IconNotes,
  IconTable,
  IconUsers,
} from 'twenty-ui/display';
import { ComponentDecorator } from 'twenty-ui/testing';

const StyledContainer = styled.div`
  width: 480px;
`;

interface SettingsOptionCardContentSelectProps
  extends React.ComponentProps<typeof SettingsOptionCardContentSelect> {}

interface SettingsOptionCardContentSelectWrapperProps
  extends SettingsOptionCardContentSelectProps {
  onChange: any;
  options: any;
  value: any;
  dropdownId: string;
}
const SettingsOptionCardContentSelectWrapper = <Value extends SelectValue>(
  args: SettingsOptionCardContentSelectWrapperProps,
) => {
  const [value] = useState<Value>(args.value);

  return (
    <StyledContainer>
      <SettingsOptionCardContentSelect
        Icon={args.Icon}
        title={args.title}
        description={args.description}
      >
        <Select<Value>
          value={value}
          onChange={args.onChange}
          dropdownId={args.dropdownId}
          options={args.options}
          selectSizeVariant="small"
          dropdownWidth={120}
        />
      </SettingsOptionCardContentSelect>
    </StyledContainer>
  );
};

const meta: Meta<typeof SettingsOptionCardContentSelectWrapper> = {
  title: 'Modules/Settings/SettingsOptionCardContentSelect',
  component: SettingsOptionCardContentSelectWrapper,
  decorators: [ComponentDecorator],
  parameters: {
    maxWidth: 800,
  },
};

export default meta;
type Story = StoryObj<typeof SettingsOptionCardContentSelectWrapper>;

export const StringSelect: Story = {
  args: {
    Icon: IconLanguage,
    title: 'Language',
    description: 'Select your preferred language',
    value: 'en',
    options: [
      { value: 'en', label: 'English' },
      { value: 'fr', label: 'French' },
      { value: 'es', label: 'Spanish' },
    ],
    dropdownId: 'language-select',
  },
  argTypes: {
    Icon: { control: false },
    onChange: { control: false },
  },
};

export const NumberSelect: Story = {
  args: {
    Icon: IconNotes,
    title: 'Items Per Page',
    description: 'Number of items to display per page',
    value: 25,
    options: [
      { value: 10, label: '10' },
      { value: 25, label: '25' },
      { value: 50, label: '50' },
      { value: 100, label: '100' },
    ],
    dropdownId: 'page-size-select',
  },
};

export const WithIconOptions: Story = {
  args: {
    Icon: IconUsers,
    title: 'Team View',
    description: 'Select how to display team members',
    value: 'grid',
    options: [
      { value: 'list', label: 'List View', Icon: IconList },
      { value: 'kanban', label: 'Kanban View', Icon: IconLayoutKanban },
      { value: 'table', label: 'Table View', Icon: IconTable },
    ],
    dropdownId: 'view-select',
  },
};

export const Disabled: Story = {
  args: {
    Icon: IconUsers,
    title: 'Disabled Select',
    description: 'This select is currently disabled',
    disabled: true,
    value: 'option1',
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ],
    dropdownId: 'disabled-select',
  },
};

export const FullWidth: Story = {
  args: {
    title: 'Full Width Select',
    description: 'This select uses the full width of the dropdown',
    value: 'short',
    options: [
      { value: 'short', label: 'Short option' },
      {
        value: 'very-long',
        label: 'This is a very long option that needs more space',
      },
      {
        value: 'another-long',
        label: 'Another long option that extends the width',
      },
    ],
    dropdownId: 'full-width-select',
  },
};
