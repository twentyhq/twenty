import { WorkflowEditActionCodeFields } from '@/workflow/workflow-steps/workflow-actions/code-action/components/WorkflowEditActionCodeFields';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';

const meta: Meta<typeof WorkflowEditActionCodeFields> = {
  title: 'Modules/Workflow/Actions/Code/Fields',
  component: WorkflowEditActionCodeFields,
  decorators: [
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    WorkflowStepDecorator,
  ],
  args: {
    functionInput: { channels: ['fax', 'email'] },
    inputSchema: [
      {
        type: 'object',
        properties: {
          channels: {
            type: 'array',
            label: 'Channels',
            items: {
              type: 'string',
              enum: ['email', 'sms'],
            },
          },
        },
      },
    ],
    onInputChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof WorkflowEditActionCodeFields>;

export const EnumArrayWithUnknownValue: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Channels' }),
    );

    const picker = within(
      await body.findByRole('dialog', { name: 'Channels' }),
    );

    expect(await picker.findByRole('button', { name: 'fax' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await userEvent.click(picker.getByRole('button', { name: 'email' }));

    await waitFor(() => {
      expect(args.onInputChange).toHaveBeenCalledTimes(1);
      expect(args.onInputChange).toHaveBeenLastCalledWith(
        ['fax'],
        ['channels'],
      );
    });
  },
};
