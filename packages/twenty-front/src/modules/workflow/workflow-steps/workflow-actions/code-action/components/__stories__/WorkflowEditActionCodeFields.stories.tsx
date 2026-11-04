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
    functionInput: { requiredFields: ['legacy_field'] },
    inputSchema: [
      {
        type: 'object',
        properties: {
          requiredFields: {
            type: 'array',
            label: 'Required fields',
            items: {
              type: 'string',
              enum: ['work_email', 'phone_numbers'],
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
      await canvas.findByRole('button', { name: 'Required fields' }),
    );

    const picker = within(
      await body.findByRole('dialog', { name: 'Required fields' }),
    );

    expect(
      await picker.findByRole('button', { name: 'legacy_field' }),
    ).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(picker.getByRole('button', { name: 'work_email' }));

    await waitFor(() => {
      expect(args.onInputChange).toHaveBeenLastCalledWith(
        expect.arrayContaining(['work_email', 'legacy_field']),
        ['requiredFields'],
      );
    });
  },
};
