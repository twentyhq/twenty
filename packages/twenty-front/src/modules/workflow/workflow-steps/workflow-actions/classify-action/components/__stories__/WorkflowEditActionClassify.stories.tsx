import { type WorkflowClassifyAction } from '@/workflow/types/Workflow';
import { WorkflowEditActionClassify } from '@/workflow/workflow-steps/workflow-actions/classify-action/components/WorkflowEditActionClassify';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, screen, userEvent, within } from 'storybook/test';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';
import { Button } from 'twenty-ui/primitives/input';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getWorkflowNodeIdMock } from '~/testing/mock-data/workflow';

const DEFAULT_ACTION: WorkflowClassifyAction = {
  id: getWorkflowNodeIdMock(),
  name: 'Classify',
  type: 'CLASSIFY',
  valid: false,
  settings: {
    input: { state: '', questions: [] },
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: 0 },
      continueOnFailure: { value: false },
    },
  },
};

const meta = {
  title: 'Modules/Workflow/Actions/Classify/EditAction',
  component: WorkflowEditActionClassify,
  parameters: { msw: graphqlMocks, mockingDate: null },
  decorators: [
    WorkflowStepDecorator,
    ComponentDecorator,
    RouterDecorator,
    WorkspaceDecorator,
  ],
  args: { action: DEFAULT_ACTION, actionOptions: { onActionUpdate: fn() } },
  render: function Render(args) {
    const [action, setAction] = useState(args.action);
    return (
      <WorkflowEditActionClassify
        {...args}
        action={action}
        actionOptions={{
          onActionUpdate: async (updated) => setAction(updated),
        }}
      />
    );
  },
} satisfies Meta<typeof WorkflowEditActionClassify>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AddsQuestionAndChangesType: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Add question' }),
    );
    await expect(
      await canvas.findByText('Lawyer', { selector: 'p' }),
    ).toBeVisible();
    await expect(await canvas.findByText('Option 2 name')).toBeVisible();
    await userEvent.click(await canvas.findByText('Pick one option'));
    await userEvent.click(await screen.findByText('Grade on a scale'));
    await expect(
      await canvas.findByText('Dissatisfied', { selector: 'p' }),
    ).toBeVisible();
    await expect(await canvas.findByText('Level 2 name')).toBeVisible();
    await expect(canvas.queryByText('Model')).not.toBeInTheDocument();
    await userEvent.click(
      (await canvas.findAllByRole('button', { name: 'Delete level' }))[0],
    );
    await expect(
      canvas.queryByText('Dissatisfied', { selector: 'p' }),
    ).not.toBeInTheDocument();
  },
};

export const EditsBeforeSaveResponse: Story = {
  render: function Render(args) {
    const [action, setAction] = useState(args.action);
    const [saves, setSaves] = useState<
      { action: WorkflowClassifyAction; complete: () => void }[]
    >([]);

    return (
      <>
        <WorkflowEditActionClassify
          {...args}
          action={action}
          actionOptions={{
            onActionUpdate: (updated) =>
              new Promise<void>((resolve) => {
                setSaves((current) => [
                  ...current,
                  { action: updated, complete: resolve },
                ]);
              }),
          }}
        />
        {saves.length > 0 && (
          <Button
            onClick={() => {
              const [save, ...remaining] = saves;
              setAction(save.action);
              setSaves(remaining);
              save.complete();
            }}
          >
            Complete next save
          </Button>
        )}
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Add question' }),
    );
    const completeSave = await canvas.findByRole(
      'button',
      { name: 'Complete next save' },
      { timeout: 5000 },
    );
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Add question' }),
    );
    await userEvent.click(completeSave);
    await expect(await canvas.findAllByText('Pick one option')).toHaveLength(2);
    await userEvent.click(
      await canvas.findByRole(
        'button',
        { name: 'Complete next save' },
        { timeout: 5000 },
      ),
    );
    await expect(await canvas.findAllByText('Pick one option')).toHaveLength(2);
  },
};
