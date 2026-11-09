import { DashboardFilterChip } from '@/page-layout/components/DashboardFilterChip';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ViewFilterOperand } from '~/generated-metadata/graphql';

const meta: Meta<typeof DashboardFilterChip> = {
  title: 'Modules/PageLayout/DashboardFilterChip',
  component: DashboardFilterChip,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 480, height: 560 } },
  args: {
    pageLayoutFilterId: 'date-range-filter',
    label: 'Date range',
    value: {
      conditions: [
        { operand: ViewFilterOperand.IS_RELATIVE, value: 'PAST_7_DAY' },
      ],
    },
    onChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ShowsTheValueWithoutARemoveButton: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole('button', { name: 'Date range: Past 7 days' }),
    ).toBeVisible();
    expect(canvas.getByText('Date range')).toBeVisible();
    expect(canvas.getByText(': Past 7 days')).toBeVisible();
    expect(canvas.getAllByRole('button')).toHaveLength(1);
  },
};

export const ShowsANeutralButtonWithNoDateRange: Story = {
  args: { value: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const button = await canvas.findByRole('button', { name: 'Date range' });

    expect(button).toBeVisible();
    expect(canvas.queryByText(/No date range/)).not.toBeInTheDocument();
  },
};

export const ShowsAFocusRingOnKeyboardFocus: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button', {
      name: 'Date range: Past 7 days',
    });

    await userEvent.tab();

    expect(trigger).toHaveFocus();
    expect(getComputedStyle(trigger).outlineStyle).toBe('solid');
    expect(getComputedStyle(trigger).outlineWidth).toBe('2px');
  },
};

export const OpensWithTheFilterLabelAsTitle: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Date range: Past 7 days' }),
    );

    const dropdown = within(
      await body.findByRole('dialog', { name: 'Date range' }),
    );

    expect(dropdown.getByText('Date range')).toBeVisible();
    expect(dropdown.getByRole('button', { name: 'Go back' })).toBeVisible();
    expect(dropdown.getByText('Relative date')).toBeVisible();
    expect(dropdown.getByText('Past')).toBeVisible();
  },
};

export const ClosesFromTheHeaderButton: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole('button', {
      name: 'Date range: Past 7 days',
    });

    await userEvent.click(trigger);
    await userEvent.click(
      within(await body.findByRole('dialog', { name: 'Date range' })).getByRole(
        'button',
        { name: 'Go back' },
      ),
    );

    await waitFor(() =>
      expect(
        body.queryByRole('dialog', { name: 'Date range' }),
      ).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
  },
};

export const OpensWithItsTitleInEditMode: Story = {
  args: { title: 'Default for everyone', value: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Date range' }),
    );

    const dropdown = within(
      await body.findByRole('dialog', { name: 'Date range' }),
    );

    expect(dropdown.getByText('Default for everyone')).toBeVisible();
    expect(dropdown.getByText('No date range')).toBeVisible();
    expect(
      dropdown.queryByRole('group', { name: 'Choose a date' }),
    ).not.toBeInTheDocument();
  },
};

export const OpensACustomRangeWithOneInlineCalendar: Story = {
  args: {
    value: {
      conditions: [
        { operand: ViewFilterOperand.IS_AFTER, value: '2026-03-10' },
        { operand: ViewFilterOperand.IS_BEFORE, value: '2026-03-21' },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole('button', { name: /^Date range: Mar 10/ }),
    );

    const dropdown = within(
      await body.findByRole('dialog', { name: 'Date range' }),
    );

    expect(dropdown.getByText('Custom range')).toBeVisible();
    expect(dropdown.getByRole('textbox', { name: 'Start date' })).toHaveValue(
      '03/10/2026',
    );
    expect(dropdown.getByRole('textbox', { name: 'End date' })).toHaveValue(
      '03/20/2026',
    );
    expect(
      dropdown.getAllByRole('group', { name: 'Choose a date' }),
    ).toHaveLength(1);
  },
};
