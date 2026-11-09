import { DashboardFilterChip } from '@/page-layout/components/DashboardFilterChip';
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

// The input only renders inside the control's dropdown, so each story opens it first
const PageLayoutFilterValueInputStory = ({
  initialValue,
  onChange,
}: PageLayoutFilterValueInputStoryProps) => {
  const [value, setValue] = useState(initialValue);

  return (
    <DashboardFilterChip
      pageLayoutFilterId="date-range-filter"
      label="Date range"
      value={value}
      onChange={(newValue) => {
        setValue(newValue);
        onChange(newValue);
      }}
    />
  );
};

const openDropdown = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);

  await userEvent.click(
    await canvas.findByRole('button', { name: /^Date range/ }),
  );

  return within(
    await within(canvasElement.ownerDocument.body).findByRole('dialog', {
      name: 'Date range',
    }),
  );
};

const meta: Meta<typeof PageLayoutFilterValueInputStory> = {
  title: 'Modules/PageLayout/PageLayoutFilterValueInput',
  component: PageLayoutFilterValueInputStory,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 480, height: 640 } },
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
    const dropdown = await openDropdown(canvasElement);

    expect(await dropdown.findByText('Relative date')).toBeVisible();
    expect(dropdown.getByText('This')).toBeVisible();
    expect(dropdown.getByText('Month')).toBeVisible();
    expect(
      dropdown.getByRole('group', { name: 'Choose a date' }),
    ).toBeVisible();
  },
};

export const ClampsAmountAboveLimit: Story = {
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    const dropdown = await openDropdown(canvasElement);

    await userEvent.click(await dropdown.findByText('This'));
    await userEvent.click(await body.findByRole('option', { name: 'Past' }));

    await userEvent.clear(dropdown.getByPlaceholderText('Number'));
    await userEvent.type(dropdown.getByPlaceholderText('Number'), '5000');

    expect(
      await dropdown.findByText('Amount must be 1000 or less.'),
    ).toHaveAttribute('role', 'alert');
    await waitFor(() =>
      expect(dropdown.getByPlaceholderText('Number')).toHaveValue('1000'),
    );
    expect(args.onChange).toHaveBeenLastCalledWith({
      conditions: [
        {
          operand: ViewFilterOperand.IS_RELATIVE,
          value: 'PAST_1000_MONTH',
        },
      ],
    });

    await userEvent.click(dropdown.getByText('Months'));
    await userEvent.click(await body.findByRole('option', { name: 'Weeks' }));

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
    expect(dropdown.getByPlaceholderText('Number')).toHaveValue('1000');
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
    const dropdown = await openDropdown(canvasElement);
    const endDate = await dropdown.findByRole('textbox', { name: 'End date' });

    await userEvent.click(endDate);
    await userEvent.click(
      await dropdown.findByRole('gridcell', { name: /March 5th, 2026/ }),
    );

    expect(
      await dropdown.findByText('End date must be after start date.'),
    ).toHaveAttribute('role', 'alert');
    expect(dropdown.getByRole('textbox', { name: 'End date' })).toHaveValue(
      '03/20/2026',
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
    const body = within(canvasElement.ownerDocument.body);
    const dropdown = await openDropdown(canvasElement);

    expect(await dropdown.findByText('Other value')).toBeVisible();
    expect(
      dropdown.getByText(
        "This value can't be edited here. Pick another option to replace it.",
      ),
    ).toBeVisible();
    expect(args.onChange).not.toHaveBeenCalled();

    await userEvent.click(dropdown.getByText('Other value'));
    await userEvent.click(
      await body.findByRole('option', { name: 'No date range' }),
    );

    expect(args.onChange).toHaveBeenLastCalledWith(null);
    expect(await dropdown.findByText('No date range')).toBeVisible();
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
    const dropdown = await openDropdown(canvasElement);

    expect(await dropdown.findByText('Other value')).toBeVisible();
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
    const body = within(canvasElement.ownerDocument.body);
    const dropdown = await openDropdown(canvasElement);

    await userEvent.click(await dropdown.findByText('This'));
    await userEvent.click(await body.findByRole('option', { name: 'Next' }));

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
    const body = within(canvasElement.ownerDocument.body);
    const dropdown = await openDropdown(canvasElement);

    await userEvent.click(await dropdown.findByText('Relative date'));
    await userEvent.click(
      await body.findByRole('option', { name: 'Custom range' }),
    );

    const startDate = await dropdown.findByRole('textbox', {
      name: 'Start date',
    });

    expect(args.onChange).not.toHaveBeenCalled();

    await userEvent.click(startDate);
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
    const body = within(canvasElement.ownerDocument.body);
    const dropdown = await openDropdown(canvasElement);

    await userEvent.click(await dropdown.findByText('Relative date'));
    await userEvent.click(
      await body.findByRole('option', { name: 'Custom range' }),
    );
    await userEvent.click(await dropdown.findByText('Custom range'));
    await userEvent.click(
      await body.findByRole('option', { name: 'Relative date' }),
    );

    expect(await dropdown.findByText('Next')).toBeVisible();
    expect(dropdown.getByPlaceholderText('Number')).toHaveValue('1');
    expect(dropdown.getByText('Week')).toBeVisible();
    expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const AppliesTheShownRelativeDateWhenChosen: Story = {
  args: { initialValue: null },
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    const dropdown = await openDropdown(canvasElement);

    await userEvent.click(await dropdown.findByText('No date range'));
    await userEvent.click(
      await body.findByRole('option', { name: 'Relative date' }),
    );

    expect(args.onChange).toHaveBeenLastCalledWith({
      conditions: [
        { operand: ViewFilterOperand.IS_RELATIVE, value: 'THIS_1_DAY' },
      ],
    });
    expect(await dropdown.findByText('This')).toBeVisible();
    expect(dropdown.getByText('Day')).toBeVisible();
    expect(
      await within(canvasElement).findByRole('button', {
        name: /^Date range: /,
      }),
    ).toBeVisible();
  },
};

export const HasNoClearRowForARelativeDate: Story = {
  play: async ({ canvasElement }) => {
    const dropdown = await openDropdown(canvasElement);

    expect(await dropdown.findByText('Relative date')).toBeVisible();
    expect(dropdown.queryByText('Clear')).not.toBeInTheDocument();
  },
};

export const ClearEmptiesTheRangeAndStaysOnCustomRange: Story = {
  args: {
    initialValue: {
      conditions: [
        { operand: ViewFilterOperand.IS_AFTER, value: '2026-03-10' },
        { operand: ViewFilterOperand.IS_BEFORE, value: '2026-03-21' },
      ],
    },
  },
  play: async ({ canvasElement, args }) => {
    const dropdown = await openDropdown(canvasElement);

    await userEvent.click(await dropdown.findByText('Clear'));

    expect(args.onChange).toHaveBeenLastCalledWith(null);
    expect(await dropdown.findByText('Custom range')).toBeVisible();
    for (const bound of ['Start date', 'End date']) {
      expect(dropdown.getByRole('textbox', { name: bound })).toHaveDisplayValue(
        /^[^\d]*$/,
      );
    }
    expect(
      dropdown.getByRole('group', { name: 'Choose a date' }),
    ).toBeVisible();
  },
};

export const DrawsACustomRangeLikeARelativeOne: Story = {
  args: {
    initialValue: {
      conditions: [
        { operand: ViewFilterOperand.IS_AFTER, value: '2026-03-10' },
        { operand: ViewFilterOperand.IS_BEFORE, value: '2026-03-21' },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const dropdown = await openDropdown(canvasElement);
    const getDay = (name: RegExp) => dropdown.getByRole('gridcell', { name });
    const startDay = await dropdown.findByRole('gridcell', {
      name: /March 10th, 2026/,
    });
    const endDay = getDay(/March 20th, 2026/);

    expect(getComputedStyle(getDay(/March 15th, 2026/)).opacity).toBe('0.5');
    expect(getComputedStyle(startDay).opacity).toBe('1');
    expect(getComputedStyle(endDay).opacity).toBe('1');

    await userEvent.hover(endDay);

    expect(getComputedStyle(endDay).backgroundColor).toBe(
      getComputedStyle(startDay).backgroundColor,
    );

    const [activeBoundRowStyle, otherBoundRowStyle] = [
      'Start date',
      'End date',
    ].map((name) =>
      getComputedStyle(
        dropdown.getByRole('textbox', { name }).closest('label') ??
          document.body,
      ),
    );

    expect(activeBoundRowStyle.boxShadow).toBe('none');
    expect(activeBoundRowStyle.backgroundColor).not.toBe(
      otherBoundRowStyle.backgroundColor,
    );
  },
};

export const PicksACustomRangeFromTheInlineCalendar: Story = {
  args: { initialValue: null },
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    const dropdown = await openDropdown(canvasElement);

    await userEvent.click(await dropdown.findByText('No date range'));
    await userEvent.click(
      await body.findByRole('option', { name: 'Custom range' }),
    );

    expect(args.onChange).not.toHaveBeenCalled();
    expect(dropdown.getByRole('textbox', { name: 'Start date' })).toBeVisible();
    expect(dropdown.getByRole('textbox', { name: 'End date' })).toBeVisible();
    expect(
      dropdown.getAllByRole('group', { name: 'Choose a date' }),
    ).toHaveLength(1);
    expect(
      dropdown.queryByRole('gridcell', { selected: true }),
    ).not.toBeInTheDocument();

    const [firstDayOfMonth] = await dropdown.findAllByRole('gridcell', {
      name: /1st,/,
    });

    await userEvent.click(firstDayOfMonth);

    // The calendar follows the bound it edits, so it is drawn again after each pick
    const [tenthDayOfMonth] = await dropdown.findAllByRole('gridcell', {
      name: /10th,/,
    });

    await userEvent.click(tenthDayOfMonth);

    await waitFor(() =>
      expect(args.onChange).toHaveBeenLastCalledWith({
        conditions: [
          {
            operand: ViewFilterOperand.IS_AFTER,
            value: expect.stringMatching(/-01$/),
          },
          {
            operand: ViewFilterOperand.IS_BEFORE,
            value: expect.stringMatching(/-11$/),
          },
        ],
      }),
    );
    expect(
      await within(canvasElement).findByRole('button', {
        name: /^Date range: .+ – .+$/,
      }),
    ).toBeVisible();
  },
};

const MIXED_OTHER_VALUE = {
  conditions: [
    { operand: ViewFilterOperand.IS_AFTER, value: '2024-01-01' },
    { operand: ViewFilterOperand.IS_RELATIVE, value: 'PAST_3_HOUR' },
  ],
};

export const StartsACustomRangeEmptyFromOtherValue: Story = {
  args: { initialValue: MIXED_OTHER_VALUE },
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    const dropdown = await openDropdown(canvasElement);

    await userEvent.click(await dropdown.findByText('Other value'));
    await userEvent.click(
      await body.findByRole('option', { name: 'Custom range' }),
    );

    const startDate = await dropdown.findByRole('textbox', {
      name: 'Start date',
    });
    const endDate = dropdown.getByRole('textbox', { name: 'End date' });

    expect(startDate).toHaveDisplayValue(/^[^\d]*$/);
    expect(endDate).toHaveDisplayValue(/^[^\d]*$/);

    await userEvent.click(endDate);
    const [fifteenthDayOfMonth] = await dropdown.findAllByRole('gridcell', {
      name: /15th,/,
    });
    await userEvent.click(fifteenthDayOfMonth);

    await waitFor(() =>
      expect(args.onChange).toHaveBeenLastCalledWith({
        conditions: [
          {
            operand: ViewFilterOperand.IS_BEFORE,
            value: expect.stringMatching(/-16$/),
          },
        ],
      }),
    );
  },
};

export const AppliesThisDayFromOtherValue: Story = {
  args: { initialValue: MIXED_OTHER_VALUE },
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    const dropdown = await openDropdown(canvasElement);

    await userEvent.click(await dropdown.findByText('Other value'));
    await userEvent.click(
      await body.findByRole('option', { name: 'Relative date' }),
    );

    expect(args.onChange).toHaveBeenLastCalledWith({
      conditions: [
        { operand: ViewFilterOperand.IS_RELATIVE, value: 'THIS_1_DAY' },
      ],
    });
  },
};
