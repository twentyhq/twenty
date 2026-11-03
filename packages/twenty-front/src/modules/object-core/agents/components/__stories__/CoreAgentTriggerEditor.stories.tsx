import { CoreAgentTriggerEditorExample } from '@/object-core/agents/components/__stories__/CoreAgentTriggerEditorExample';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CatalogDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof CoreAgentTriggerEditorExample> = {
  title: 'Modules/ObjectCore/Agents/CoreAgentTriggerEditor',
  component: CoreAgentTriggerEditorExample,
  decorators: [CatalogDecorator],
  parameters: { catalog: { options: { elementContainer: { width: 420 } } } },
  args: { onSave: fn() },
};

export default meta;
type Story = StoryObj<typeof CoreAgentTriggerEditorExample>;

export const InvalidScheduleAndCancel: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const pattern = canvas.getByRole('textbox', { name: 'Expression' });
    const save = canvas.getByRole('button', { name: 'Save settings' });
    const active = canvas.getByRole('switch', { name: 'Active' });
    const instructions = canvas.getByRole('textbox', { name: 'Instructions' });

    await expect(active).not.toBeChecked();
    await expect(instructions).toHaveValue('Send the weekly report');
    await userEvent.clear(pattern);
    await userEvent.type(pattern, '0 9 *');
    await expect(pattern).toHaveValue('0 9 *');
    await expect(save).toBeDisabled();
    await expect(
      canvas.getByText('Fix the invalid trigger before saving settings.'),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Cancel settings' }),
    );
    await expect(
      canvas.getByRole('textbox', { name: 'Expression' }),
    ).toHaveValue('0 9 * * 1');
    await expect(
      canvas.getByRole('switch', { name: 'Active' }),
    ).not.toBeChecked();
    await expect(
      canvas.getByRole('textbox', { name: 'Instructions' }),
    ).toHaveValue('Send the weekly report');
    await userEvent.click(canvas.getByRole('switch', { name: 'Active' }));
    await expect(save).toBeEnabled();
    await userEvent.click(save);
    await expect(args.onSave).toHaveBeenCalledWith([
      expect.objectContaining({
        isActive: true,
        instructions: 'Send the weekly report',
        settings: { pattern: '0 9 * * 1' },
      }),
      {
        id: 'unsupported-0',
        type: 'WEBHOOK',
        futureSettings: { preserve: true },
      },
    ]);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove trigger 2' }),
    );
    await expect(
      canvas.queryByText('Unsupported trigger'),
    ).not.toBeInTheDocument();
  },
};

export const InvalidNumericScheduleAndCancel: Story = {
  args: { initialPattern: '0 9 */1 * *' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const hour = canvas.getByRole('textbox', { name: 'Trigger at hour (UTC)' });
    const save = canvas.getByRole('button', { name: 'Save settings' });
    await userEvent.clear(hour);
    await userEvent.type(hour, '24');
    await expect(hour).toHaveValue('24');
    await expect(save).toBeDisabled();
    await expect(canvas.getByText('Invalid schedule')).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Cancel settings' }),
    );
    await expect(
      canvas.getByRole('textbox', { name: 'Trigger at hour (UTC)' }),
    ).toHaveValue('9');
    await expect(
      canvas.getByRole('switch', { name: 'Active' }),
    ).not.toBeChecked();
    await userEvent.clear(
      canvas.getByRole('textbox', { name: 'Trigger at hour (UTC)' }),
    );
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Trigger at hour (UTC)' }),
      '10',
    );
    await expect(save).toBeEnabled();
    await userEvent.click(save);
    await expect(args.onSave).toHaveBeenCalledWith([
      expect.objectContaining({
        isActive: false,
        instructions: 'Send the weekly report',
        settings: { pattern: '0 10 */1 * *' },
      }),
      {
        id: 'unsupported-0',
        type: 'WEBHOOK',
        futureSettings: { preserve: true },
      },
    ]);
  },
};

export const TwentyTriggerLimit: Story = {
  args: { triggerCount: 20 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('button', { name: 'Add trigger' }),
    ).toBeDisabled();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove trigger 20' }),
    );
    await expect(
      canvas.getByRole('button', { name: 'Add trigger' }),
    ).toBeEnabled();
  },
};

export const ReadOnly: Story = {
  args: { readOnly: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('textbox', { name: 'Expression' }),
    ).toBeDisabled();
    await expect(
      canvas.getByRole('textbox', { name: 'Instructions' }),
    ).toBeDisabled();
    await expect(
      canvas.getByRole('switch', { name: 'Active' }),
    ).toHaveAttribute('aria-disabled', 'true');
    await expect(
      canvas.getByRole('button', { name: 'Remove trigger 2' }),
    ).toBeDisabled();
  },
};
