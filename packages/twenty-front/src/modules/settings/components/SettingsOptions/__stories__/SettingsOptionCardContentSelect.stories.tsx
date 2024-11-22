import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import styled from '@emotion/styled';
import { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  ComponentDecorator,
  IconLanguage,
  IconLayoutKanban,
  IconList,
  IconNotes,
  IconTable,
  IconUsers,
} from 'twenty-ui';

const StyledContainer = styled.div`
  width: 480px;
`;

type SelectValue = string | number | boolean | null;

const SettingsOptionCardContentSelectWrapper = <Value extends SelectValue>(
  args: React.ComponentProps<typeof SettingsOptionCardContentSelect<Value>>,
) => {
  const [value, setValue] = useState<Value>(args.value);

  return (
    <StyledContainer>
      <SettingsOptionCardContentSelect
        value={value}
        onChange={(newValue) => setValue(newValue as Value)}
        Icon={args.Icon}
        title={args.title}
        description={args.description}
        divider={args.divider}
        disabled={args.disabled}
        options={args.options}
        selectClassName={args.selectClassName}
        dropdownId={args.dropdownId}
        fullWidth={args.fullWidth}
      />
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
    fullWidth: true,
  },
};
