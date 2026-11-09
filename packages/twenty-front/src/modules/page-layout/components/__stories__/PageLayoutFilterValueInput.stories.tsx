import { PageLayoutFilterValueInput } from '@/page-layout/components/PageLayoutFilterValueInput';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import {
  type PageLayoutFilterValue,
  ViewFilterOperand,
} from '~/generated-metadata/graphql';

type PageLayoutFilterValueInputStoryProps = {
  initialValue: PageLayoutFilterValue | null;
  onChange: (value: PageLayoutFilterValue | null) => void;
};

const PageLayoutFilterValueInputStory = ({
  initialValue,
  onChange,
}: PageLayoutFilterValueInputStoryProps) => {
  const [value, setValue] = useState(initialValue);

  return (
    <PageLayoutFilterValueInput
      label="Default value"
      emptyValueLabel="No default"
      value={value}
      onChange={(newValue) => {
        setValue(newValue);
        onChange(newValue);
      }}
    />
  );
};

const meta: Meta<typeof PageLayoutFilterValueInputStory> = {
  title: 'Modules/PageLayout/PageLayoutFilterValueInput',
  component: PageLayoutFilterValueInputStory,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 360 } },
  args: {
    onChange: fn(),
    initialValue: {
      conditions: [
        { operand: ViewFilterOperand.IS_RELATIVE, value: 'THIS_1_MONTH' },
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const RelativeDate: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Relative date')).toBeVisible();
    expect(canvas.getByText('This')).toBeVisible();
    expect(canvas.getByText('Month')).toBeVisible();
  },
};

export const ClampsAmountAboveLimit: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(await canvas.findByText('This'));
    await userEvent.click(await body.findByText('Past'));

    await userEvent.clear(canvas.getByPlaceholderText('Number'));
    await userEvent.type(canvas.getByPlaceholderText('Number'), '5000');

    expect(
      await canvas.findByText('Use an amount of 1000 or less.'),
    ).toBeVisible();
    expect(canvas.getByPlaceholderText('Number')).toHaveValue('1000');
    expect(args.onChange).toHaveBeenLastCalledWith({
      conditions: [
        {
          operand: ViewFilterOperand.IS_RELATIVE,
          value: 'PAST_1000_MONTH',
        },
      ],
    });

    await userEvent.click(canvas.getByText('Months'));
    await userEvent.click(await body.findByText('Weeks'));

    await waitFor(() =>
      expect(args.onChange).toHaveBeenLastCalledWith({
        conditions: [
          {
            operand: ViewFilterOperand.IS_RELATIVE,
            value: 'PAST_1000_WEEK',
          },
        ],
      }),
    );
    expect(canvas.getByPlaceholderText('Number')).toHaveValue('1000');
  },
};

export const RefusesEndDateBeforeStartDate: Story = {
  args: {
    initialValue: {
      conditions: [
        { operand: ViewFilterOperand.IS_AFTER, value: '2026-03-10' },
        { operand: ViewFilterOperand.IS_BEFORE, value: '2026-03-21' },
      ],
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    const endDateInput = canvasElement.querySelectorAll('input')[1];
    const endDateBeforeChange = endDateInput.value;

    await userEvent.click(endDateInput);
    await userEvent.click(
      await body.findByRole('gridcell', { name: /March 5th, 2026/ }),
    );

    expect(
      await canvas.findByText(
        'The end date must be on or after the start date.',
      ),
    ).toBeVisible();
    expect(canvasElement.querySelectorAll('input')[1]).toHaveValue(
      endDateBeforeChange,
    );
    expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const KeepsUnsupportedValueAsOtherValue: Story = {
  args: {
    initialValue: {
      conditions: [{ operand: ViewFilterOperand.IS_TODAY, value: '' }],
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    expect(await canvas.findByText('Other value')).toBeVisible();
    expect(
      canvas.getByText(
        "This value can't be edited here. Pick another option to replace it.",
      ),
    ).toBeVisible();
    expect(args.onChange).not.toHaveBeenCalled();

    await userEvent.click(canvas.getByText('Other value'));
    await userEvent.click(await body.findByText('No default'));

    expect(args.onChange).toHaveBeenLastCalledWith(null);
    expect(await canvas.findByText('No default')).toBeVisible();
  },
};

export const KeepsSubDayRelativeDateAsOtherValue: Story = {
  args: {
    initialValue: {
      conditions: [
        { operand: ViewFilterOperand.IS_RELATIVE, value: 'PAST_3_HOUR' },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Other value')).toBeVisible();
  },
};

export const StoresZonedRelativeDateWithoutZone: Story = {
  args: {
    initialValue: {
      conditions: [
        {
          operand: ViewFilterOperand.IS_RELATIVE,
          value: 'THIS_1_MONTH;;Europe/Paris;;MONDAY;;',
        },
      ],
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(await canvas.findByText('This'));
    await userEvent.click(await body.findByText('Next'));

    await waitFor(() =>
      expect(args.onChange).toHaveBeenLastCalledWith({
        conditions: [
          { operand: ViewFilterOperand.IS_RELATIVE, value: 'NEXT_1_MONTH' },
        ],
      }),
    );
  },
};

export const KeepsTheValueUntilADateIsEntered: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(await canvas.findByText('Relative date'));
    await userEvent.click(
      await body.findByRole('option', { name: 'Custom range' }),
    );

    const [startDateInput] = await canvas.findAllByRole('textbox', {
      name: 'Date',
    });

    expect(args.onChange).not.toHaveBeenCalled();

    await userEvent.click(startDateInput);
    await userEvent.keyboard('03102026');

    await waitFor(() =>
      expect(args.onChange).toHaveBeenLastCalledWith({
        conditions: [
          { operand: ViewFilterOperand.IS_AFTER, value: '2026-03-10' },
        ],
      }),
    );
  },
};

export const KeepsTheRelativeValueAcrossModes: Story = {
  args: {
    initialValue: {
      conditions: [
        { operand: ViewFilterOperand.IS_RELATIVE, value: 'NEXT_1_WEEK' },
      ],
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(await canvas.findByText('Relative date'));
    await userEvent.click(
      await body.findByRole('option', { name: 'Custom range' }),
    );
    await userEvent.click(await canvas.findByText('Custom range'));
    await userEvent.click(
      await body.findByRole('option', { name: 'Relative date' }),
    );

    expect(await canvas.findByText('Next')).toBeVisible();
    expect(canvas.getByPlaceholderText('Number')).toHaveValue('1');
    expect(canvas.getByText('Week')).toBeVisible();
    expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const AppliesARelativeDateOnceOneIsPicked: Story = {
  args: { initialValue: null },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(await canvas.findByText('No default'));
    await userEvent.click(
      await body.findByRole('option', { name: 'Relative date' }),
    );
    await userEvent.click(await canvas.findByText('Day'));

    expect(args.onChange).not.toHaveBeenCalled();

    await userEvent.click(await body.findByRole('option', { name: 'Week' }));

    await waitFor(() =>
      expect(args.onChange).toHaveBeenLastCalledWith({
        conditions: [
          { operand: ViewFilterOperand.IS_RELATIVE, value: 'THIS_1_WEEK' },
        ],
      }),
    );
  },
};
