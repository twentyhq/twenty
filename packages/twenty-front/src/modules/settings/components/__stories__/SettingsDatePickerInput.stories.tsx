import { SettingsDatePickerInput } from '@/settings/components/SettingsDatePickerInput';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

// Midday UTC so the rendered date stays on 15 Jan 2023 across timezones
const INITIAL_DATE = new Date('2023-01-15T12:00:00Z');

const SettingsDatePickerInputStory = () => {
  const [value, setValue] = useState<Date | undefined>(INITIAL_DATE);

  return (
    <SettingsDatePickerInput label="Date" value={value} onChange={setValue} />
  );
};

const meta: Meta<typeof SettingsDatePickerInput> = {
  title: 'Modules/Settings/SettingsDatePickerInput',
  component: SettingsDatePickerInput,
  decorators: [ComponentDecorator],
  render: () => <SettingsDatePickerInputStory />,
};

export default meta;
type Story = StoryObj<typeof SettingsDatePickerInput>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(await canvas.findByText(/2023/));

    expect(await body.findByRole('combobox', { name: 'Month' })).toBeVisible();
    expect(body.getByRole('grid', { name: 'January 2023' })).toBeVisible();
  },
};

export const ChangingMonthKeepsPickerOpen: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(await canvas.findByText(/2023/));

    const monthSelect = await body.findByRole('combobox', { name: 'Month' });
    await userEvent.click(monthSelect);

    const options = within(await body.findByRole('listbox'));
    expect(monthSelect).toBeVisible();
    await userEvent.click(options.getByRole('option', { name: 'February' }));

    expect(monthSelect).toBeVisible();
    expect(monthSelect).toHaveTextContent('February');
    expect(body.getByRole('grid', { name: 'February 2023' })).toBeVisible();
  },
};
