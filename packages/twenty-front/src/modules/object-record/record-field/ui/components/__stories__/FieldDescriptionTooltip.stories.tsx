import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { FieldDescriptionTooltip } from '@/object-record/record-field/ui/components/FieldDescriptionTooltip';

const FIELD_DESCRIPTION_TOOLTIP_ANCHOR_ID = 'field-description-tooltip-anchor';
const FIELD_DESCRIPTION_ID = 'field-description-tooltip-content';

const meta: Meta<typeof FieldDescriptionTooltip> = {
  title: 'UI/Data/Field/FieldDescriptionTooltip',
  component: FieldDescriptionTooltip,
  decorators: [ComponentDecorator],
  args: {
    anchorSelect: `#${FIELD_DESCRIPTION_TOOLTIP_ANCHOR_ID}`,
    fieldDescription: 'The amount of this opportunity',
    fieldDescriptionId: FIELD_DESCRIPTION_ID,
    fieldLabel: 'Amount',
  },
  render: (args) => (
    <>
      <span
        aria-describedby={FIELD_DESCRIPTION_ID}
        id={FIELD_DESCRIPTION_TOOLTIP_ANCHOR_ID}
        tabIndex={0}
      >
        Amount
      </span>
      <FieldDescriptionTooltip {...args} />
    </>
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
      { timeout: 2000 },
    );

    expect(within(tooltip).getByText('Amount')).toBeVisible();
    expect(
      within(tooltip).getByText('The amount of this opportunity'),
    ).toBeVisible();
  },
};

export const KeyboardFocus: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const anchor = canvas.getByText('Amount');

    await userEvent.tab();

    expect(anchor).toHaveFocus();
    expect(anchor).toHaveAttribute('aria-describedby', FIELD_DESCRIPTION_ID);
    expect(
      canvasElement.ownerDocument.getElementById(FIELD_DESCRIPTION_ID),
    ).toHaveTextContent('The amount of this opportunity');

    const tooltip = await within(canvasElement.ownerDocument.body).findByRole(
      'tooltip',
      undefined,
      { timeout: 2000 },
    );

    expect(tooltip).toBeVisible();
  },
};
