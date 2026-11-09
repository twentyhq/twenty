import { DashboardFilterChip } from '@/page-layout/components/DashboardFilterChip';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ViewFilterOperand } from '~/generated-metadata/graphql';

const meta: Meta<typeof DashboardFilterChip> = {
  title: 'Modules/PageLayout/DashboardFilterChip',
  component: DashboardFilterChip,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 480, height: 320 } },
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
    expect(canvas.getAllByRole('button')).toHaveLength(1);
  },
};

export const OpensTheValueInputWithItsLabel: Story = {
  args: { inputLabel: 'Default for everyone' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Date range: Past 7 days' }),
    );

    expect(await body.findByText('Default for everyone')).toBeVisible();
    expect(await body.findByText('Relative date')).toBeVisible();
  },
};

export const ShowsWhyItIsDisabled: Story = {
  args: { disabledReason: 'Managed by an app' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const chip = await canvas.findByRole('button', {
      name: 'Date range: Past 7 days',
    });

    await userEvent.hover(chip);

    expect(await body.findByText('Managed by an app')).toBeVisible();
    expect(chip).toHaveAttribute('aria-disabled', 'true');
  },
};
