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

    await userEvent.click(
      await canvas.findByText(/2023/, {}, { timeout: 10000 }),
    );

    await body.findByRole(
      'button',
      { name: 'Select month and year' },
      { timeout: 10000 },
    );
  },
};

// Regression test for the month/year panel closing the whole picker on click.
// Opening the month select used to trigger the parent click-outside listener and
// close the date picker, so the month/year controls could never be used.
export const ChangingMonthKeepsPickerOpen: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByText(/2023/, {}, { timeout: 10000 }),
    );

    const monthYearButton = await body.findByRole(
      'button',
      { name: 'Select month and year' },
      { timeout: 10000 },
    );
    await userEvent.click(monthYearButton);

    await userEvent.click(
      await body.findByText('January', {}, { timeout: 10000 }),
    );

    // The picker must stay open after interacting with the month select
    expect(
      body.getByRole('button', { name: 'Select month and year' }),
    ).toBeInTheDocument();

    await userEvent.click(
      await body.findByText('February', {}, { timeout: 10000 }),
    );

    expect(await body.findByText('February')).toBeInTheDocument();
    expect(
      body.getByRole('button', { name: 'Select month and year' }),
    ).toBeInTheDocument();
  },
};
