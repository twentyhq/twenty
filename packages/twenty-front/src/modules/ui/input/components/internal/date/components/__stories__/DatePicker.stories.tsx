import { DatePicker } from '@/ui/input/components/internal/date/components/DatePicker';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { type RelativeDateFilter } from 'twenty-shared/utils';
import { ComponentDecorator } from 'twenty-ui/testing';
import { Text } from 'twenty-ui/primitives/typography';

const INITIAL_PLAIN_DATE = '2023-01-01';

const RELATIVE_DATE: RelativeDateFilter & { start: string; end: string } = {
  direction: 'PAST',
  amount: 7,
  unit: 'DAY',
  start: '2022-12-25',
  end: '2023-01-01',
};

const DatePickerStory = ({
  instanceId = 'story-date-picker',
  isRelative,
  clearable,
  onChange,
  onClose,
}: {
  instanceId?: string;
  isRelative?: boolean;
  clearable?: boolean;
  onChange?: (date: string | null) => void;
  onClose?: (date: string | null) => void;
}) => {
  const [plainDateString, setPlainDateString] = useState<string | null>(
    INITIAL_PLAIN_DATE,
  );

  return (
    <>
      <DatePicker
        instanceId={instanceId}
        plainDateString={plainDateString}
        onChange={(date) => {
          setPlainDateString(date);
          onChange?.(date);
        }}
        onClose={onClose}
        onClear={() => setPlainDateString(null)}
        clearable={clearable}
        isRelative={isRelative}
        relativeDate={isRelative ? RELATIVE_DATE : undefined}
      />
      <Text aria-label="Selected date">{plainDateString ?? 'None'}</Text>
    </>
  );
};

const meta: Meta<typeof DatePicker> = {
  title: 'UI/Input/Internal/Date/DatePicker',
  component: DatePicker,
  decorators: [ComponentDecorator],
  render: () => <DatePickerStory />,
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByRole(
      'gridcell',
      { name: /^Choose Sunday, January 15/ },
      { timeout: 10000 },
    );
  },
};

export const NotClearable: Story = {
  render: () => <DatePickerStory clearable={false} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByRole(
      'gridcell',
      { name: /^Choose Sunday, January 15/ },
      { timeout: 10000 },
    );
    expect(canvas.queryByText('Clear')).not.toBeInTheDocument();
  },
};

export const Relative: Story = {
  render: () => <DatePickerStory isRelative />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole(
        'gridcell',
        { name: /^Choose Sunday, December 25/ },
        { timeout: 10000 },
      ),
    ).toHaveAttribute('aria-selected', 'true');
  },
};

export const WithOpenMonthSelect: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    const monthSelect = await canvas.findByText(
      'January',
      {},
      { timeout: 10000 },
    );
    await userEvent.click(monthSelect);

    for (const monthLabel of ['February', 'June', 'December']) {
      expect(await body.findByText(monthLabel)).toBeInTheDocument();
    }
  },
};

export const WithOpenYearSelect: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    const yearSelect = await canvas.findByText('2023', {}, { timeout: 10000 });
    await userEvent.click(yearSelect);

    for (const yearLabel of ['2022', '2024']) {
      expect(await body.findByText(yearLabel)).toBeInTheDocument();
    }
  },
};

export const OpensOnlyItsOwnMonthSelect: Story = {
  render: () => (
    <>
      <DatePickerStory instanceId="first-date-picker" />
      <DatePickerStory instanceId="second-date-picker" />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const [firstMonthSelect] = await canvas.findAllByText(
      'January',
      {},
      { timeout: 10000 },
    );

    await userEvent.click(firstMonthSelect);

    await waitFor(() => {
      expect(body.getAllByRole('listbox')).toHaveLength(1);
    });
  },
};

export const NavigationDoesNotSelect: Story = {
  args: { onChange: fn(), onClose: fn() },
  render: ({ onChange, onClose }) => (
    <DatePickerStory onChange={onChange} onClose={onClose} />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: 'Next' }));
    const nextDate = await canvas.findByRole('gridcell', {
      name: /^Choose Wednesday, February 15/,
    });
    expect(canvas.getByText('February')).toBeVisible();
    expect(canvas.getByLabelText('Selected date')).toHaveTextContent(
      INITIAL_PLAIN_DATE,
    );
    expect(args.onChange).not.toHaveBeenCalled();
    expect(args.onClose).not.toHaveBeenCalled();
    await userEvent.click(nextDate);
    expect(args.onChange).toHaveBeenCalledWith('2023-02-15');
    expect(args.onClose).toHaveBeenCalledWith('2023-02-15');
  },
};

export const SelectingTheSameDateOnlyCloses: Story = {
  args: { onChange: fn(), onClose: fn() },
  render: ({ onChange, onClose }) => (
    <DatePickerStory onChange={onChange} onClose={onClose} />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole('gridcell', {
        name: /^Choose Sunday, January 1st, 2023$/,
      }),
    );
    expect(args.onChange).not.toHaveBeenCalled();
    expect(args.onClose).toHaveBeenCalledOnce();
    expect(args.onClose).toHaveBeenCalledWith(INITIAL_PLAIN_DATE);
  },
};

export const SelectsAnAdjacentMonthDate: Story = {
  args: { onChange: fn(), onClose: fn() },
  render: ({ onChange, onClose }) => (
    <DatePickerStory onChange={onChange} onClose={onClose} />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    expect(await canvas.findByText('January')).toBeVisible();
    await userEvent.click(
      await canvas.findByRole('gridcell', {
        name: /^Choose Wednesday, February 1st, 2023$/,
      }),
    );
    expect(args.onChange).toHaveBeenCalledOnce();
    expect(args.onChange).toHaveBeenCalledWith('2023-02-01');
    expect(args.onClose).toHaveBeenCalledOnce();
    expect(args.onClose).toHaveBeenCalledWith('2023-02-01');
    expect(canvas.getByLabelText('Selected date')).toHaveTextContent(
      '2023-02-01',
    );
  },
};

export const ClearSelection: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByText('Clear'));
    expect(canvas.getByLabelText('Selected date')).toHaveTextContent('None');
    await waitFor(() => {
      const selectedDates = canvas.getAllByRole('gridcell', { selected: true });
      expect(selectedDates).toHaveLength(1);
      expect(selectedDates[0]).toHaveAttribute('aria-current', 'date');
    });
  },
};
