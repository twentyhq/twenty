import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { DateInput } from '@/ui/field/input/components/DateInput';
import { DateInputFocusEffect } from '@/ui/field/input/components/__stories__/DateInputFocusEffect';

const INITIAL_DATE = '2026-01-15';
const MONTH_ROW_LABEL_PATTERN = /^Month /;

const meta: Meta<typeof DateInput> = {
  title: 'UI/Field/Input/DateInput',
  component: DateInput,
  decorators: [ComponentDecorator],
  args: {
    instanceId: 'story-date-input',
    value: INITIAL_DATE,
    onEnter: fn(),
    onEscape: fn(),
    onClickOutside: fn(),
    onChange: fn(),
  },
  render: ({
    instanceId,
    value,
    onEnter,
    onEscape,
    onClickOutside,
    onChange,
  }) => (
    <>
      <DateInputFocusEffect instanceId={instanceId} />
      <DateInput
        instanceId={instanceId}
        value={value}
        onEnter={onEnter}
        onEscape={onEscape}
        onClickOutside={onClickOutside}
        onChange={onChange}
      />
    </>
  ),
};

export default meta;

type Story = StoryObj<typeof DateInput>;

export const CalendarNavigationDoesNotSubmit: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const nextMonth = await canvas.findByRole('button', { name: 'Next' });
    const dateInput = canvas.getByRole<HTMLInputElement>('textbox', {
      name: 'Date',
    });
    const initialValue = dateInput.value;
    const initialMonth = canvas
      .getByRole('rowgroup', { name: MONTH_ROW_LABEL_PATTERN })
      .getAttribute('aria-label');

    await expect(initialMonth).toMatch(MONTH_ROW_LABEL_PATTERN);

    nextMonth.focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(
        canvas.getByRole('rowgroup', { name: MONTH_ROW_LABEL_PATTERN }),
      ).not.toHaveAttribute('aria-label', initialMonth),
    );
    await expect(dateInput).toHaveValue(initialValue);

    canvas.getByRole('button', { name: 'Previous' }).focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(
        canvas.getByRole('rowgroup', { name: MONTH_ROW_LABEL_PATTERN }),
      ).toHaveAttribute('aria-label', initialMonth),
    );
    await expect(dateInput).toHaveValue(initialValue);
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(args.onEnter).not.toHaveBeenCalled();
  },
};

export const EnterSubmitsDate: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const dateInput = await canvas.findByRole('textbox', { name: 'Date' });

    dateInput.focus();
    await userEvent.keyboard('{Enter}');

    await expect(args.onEnter).toHaveBeenCalledOnce();
    await expect(args.onEnter).toHaveBeenCalledWith(INITIAL_DATE);
  },
};
