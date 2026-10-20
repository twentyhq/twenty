import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';

const meta: Meta<typeof SaveAndCancelButtons> = {
  title: 'Modules/Settings/SaveAndCancelButtons',
  component: SaveAndCancelButtons,
  args: { onSave: fn(), onCancel: fn() },
};

export default meta;
type Story = StoryObj<typeof SaveAndCancelButtons>;

export const Default: Story = {};

export const InheritedColor: Story = {
  render: ({ onSave, onCancel }) => (
    <Text
      data-testid="accent-surface"
      style={{
        background: themeCssVariables.color.blue,
        color: themeCssVariables.font.color.onAccent,
        padding: themeCssVariables.spacing[4],
      }}
    >
      <SaveAndCancelButtons
        color="inherit"
        onSave={onSave}
        onCancel={onCancel}
      />
    </Text>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const saveButton = canvas.getByRole('button', { name: 'Save' });
    const cancelButton = canvas.getByRole('button', { name: 'Cancel' });
    const inheritedColor = getComputedStyle(
      canvas.getByTestId('accent-surface'),
    ).color;

    await expect(saveButton).toHaveAttribute('data-variant', 'outline');
    await expect(cancelButton).toHaveAttribute('data-variant', 'ghost');

    for (const button of [saveButton, cancelButton]) {
      await expect(button).toHaveAttribute('data-color', 'inherit');
      await expect(getComputedStyle(button).color).toBe(inheritedColor);
    }

    await expect(saveButton.querySelector('svg')).toHaveStyle({
      color: inheritedColor,
    });
    await userEvent.click(saveButton);
    await userEvent.click(cancelButton);
    await expect(args.onSave).toHaveBeenCalledOnce();
    await expect(args.onCancel).toHaveBeenCalledOnce();
  },
};
