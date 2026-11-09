import { PageLayoutFilterDateRangeInput } from '@/page-layout/components/PageLayoutFilterDateRangeInput';
import { getPageLayoutFilterDateRange } from '@/page-layout/utils/getPageLayoutFilterDateRange';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { type PageLayoutFilterValue } from '~/generated-metadata/graphql';

type DateRange = { startDate: string | null; endDate: string | null };

type PageLayoutFilterDateRangeInputStoryProps = {
  initialDateRange: DateRange;
  onChange: (value: PageLayoutFilterValue | null) => void;
};

const PageLayoutFilterDateRangeInputStory = ({
  initialDateRange,
  onChange,
}: PageLayoutFilterDateRangeInputStoryProps) => {
  const [dateRange, setDateRange] = useState(initialDateRange);

  return (
    <PageLayoutFilterDateRangeInput
      dateRange={dateRange}
      onChange={(value) => {
        setDateRange(getPageLayoutFilterDateRange(value));
        onChange(value);
      }}
    />
  );
};

const meta: Meta<typeof PageLayoutFilterDateRangeInputStory> = {
  title: 'Modules/PageLayout/PageLayoutFilterDateRangeInput',
  component: PageLayoutFilterDateRangeInputStory,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 280 } },
  args: {
    initialDateRange: { startDate: null, endDate: null },
    onChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const BOTH_BOUNDS: DateRange = {
  startDate: '2026-03-10',
  endDate: '2026-03-20',
};

export const Empty: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole('textbox', { name: 'Start date' }),
    ).toHaveDisplayValue(/^[^\d]*$/);
    expect(
      canvas.getByRole('textbox', { name: 'End date' }),
    ).toHaveDisplayValue(/^[^\d]*$/);
    expect(
      canvas.queryByRole('gridcell', { selected: true }),
    ).not.toBeInTheDocument();
  },
};

export const BothBounds: Story = {
  args: { initialDateRange: BOTH_BOUNDS },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole('textbox', { name: 'Start date' }),
    ).toHaveValue('03/10/2026');
    expect(canvas.getByRole('textbox', { name: 'End date' })).toHaveValue(
      '03/20/2026',
    );
  },
};

export const RefusesAnEndBeforeTheStart: Story = {
  args: { initialDateRange: BOTH_BOUNDS },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('textbox', { name: 'End date' }),
    );
    await userEvent.click(
      await canvas.findByRole('gridcell', { name: /March 5th, 2026/ }),
    );

    expect(
      await canvas.findByText('End date must be after start date.'),
    ).toHaveAttribute('role', 'alert');
    expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const ClearEmptiesBothBounds: Story = {
  args: { initialDateRange: BOTH_BOUNDS },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByText('Clear'));

    expect(args.onChange).toHaveBeenLastCalledWith(null);
    for (const name of ['Start date', 'End date']) {
      expect(canvas.getByRole('textbox', { name })).toHaveDisplayValue(
        /^[^\d]*$/,
      );
    }
  },
};
