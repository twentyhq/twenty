import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { FieldDescriptionTooltip } from '@/object-record/record-field/ui/components/FieldDescriptionTooltip';

const TOOLTIP_WAIT_TIMEOUT_MS = 5000;

const meta: Meta<typeof FieldDescriptionTooltip> = {
  title: 'UI/Data/Field/FieldDescriptionTooltip',
  component: FieldDescriptionTooltip,
  decorators: [ComponentDecorator],
  args: {
    fieldDescription: 'The amount of this opportunity',
    fieldLabel: 'Amount',
  },
  render: (args) => (
    <FieldDescriptionTooltip
      fieldDescription={args.fieldDescription}
      fieldLabel={args.fieldLabel}
    >
      <span>Amount</span>
    </FieldDescriptionTooltip>
  ),
};

export default meta;
type Story = StoryObj<typeof FieldDescriptionTooltip>;

export const Hover: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.hover(canvas.getByText('Amount'));

    const tooltip = await within(canvasElement.ownerDocument.body).findByRole(
      'tooltip',
      undefined,
      { timeout: TOOLTIP_WAIT_TIMEOUT_MS },
    );

    await waitFor(() => expect(tooltip).toBeVisible(), {
      timeout: TOOLTIP_WAIT_TIMEOUT_MS,
    });

    expect(tooltip).toHaveTextContent('Amount');
    expect(tooltip).toHaveTextContent('The amount of this opportunity');
  },
};

export const KeyboardFocus: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const anchor = canvas.getByText('Amount');

    expect(anchor).toHaveAccessibleDescription(
      'The amount of this opportunity',
    );

    await userEvent.tab();

    expect(anchor).toHaveFocus();

    const tooltip = await within(canvasElement.ownerDocument.body).findByRole(
      'tooltip',
      undefined,
      { timeout: TOOLTIP_WAIT_TIMEOUT_MS },
    );

    await waitFor(() => expect(tooltip).toBeVisible(), {
      timeout: TOOLTIP_WAIT_TIMEOUT_MS,
    });
  },
};

export const WithoutDescription: Story = {
  args: {
    fieldDescription: '',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const anchor = canvas.getByText('Amount');

    expect(anchor).not.toHaveAttribute('aria-describedby');
    expect(anchor).not.toHaveAttribute('tabindex');
    expect(
      within(canvasElement.ownerDocument.body).queryByRole('tooltip'),
    ).not.toBeInTheDocument();
  },
};
