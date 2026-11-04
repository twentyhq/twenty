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
    functionInput: {},
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
          tags: {
            type: 'array',
            label: 'Tags',
            items: { type: 'string' },
          },
        },
      },
    ],
    onInputChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof WorkflowEditActionCodeFields>;

export const PersistedUnsetEnumArray: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Required fields' }),
    );

    expect(canvas.queryByText('Tags')).not.toBeInTheDocument();

    const picker = within(
      await body.findByRole('dialog', { name: 'Required fields' }),
    );
    const workEmail = await picker.findByRole('button', { name: 'work_email' });
    const phoneNumbers = picker.getByRole('button', { name: 'phone_numbers' });

    expect(workEmail).toHaveAttribute('aria-pressed', 'false');
    expect(phoneNumbers).toHaveAttribute('aria-pressed', 'false');
    expect(args.onInputChange).not.toHaveBeenCalled();

    await userEvent.click(workEmail);
    await userEvent.click(phoneNumbers);

    await waitFor(() => {
      expect(args.onInputChange).toHaveBeenLastCalledWith(
        ['phone_numbers', 'work_email'],
        ['requiredFields'],
      );
    });

    await userEvent.click(workEmail);
    await userEvent.click(phoneNumbers);

    await waitFor(() => {
      expect(args.onInputChange).toHaveBeenLastCalledWith([], ['requiredFields']);
    });
  },
};
