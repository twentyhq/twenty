import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import {
  type RunEvaluationInputMutation,
  type RunEvaluationInputMutationVariables,
} from '~/generated-metadata/graphql';
import { SettingsAgentEvalsTab } from '~/pages/settings/ai/components/SettingsAgentEvalsTab';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const onRunEvaluationInput = fn();
const evaluationInput = 'Find all customers in Paris';
let pendingEvaluation = Promise.resolve();
let completeEvaluation = () => {};

const meta: Meta<typeof SettingsAgentEvalsTab> = {
  title: 'Pages/Settings/AI/SettingsAgentEvalsTab',
  component: SettingsAgentEvalsTab,
  decorators: [ComponentDecorator, MemoryRouterDecorator, ToastDecorator],
  args: {
    agentId: 'test-agent',
    evaluationInputs: [evaluationInput],
    onEvaluationInputsChange: fn(),
  },
  beforeEach: () => {
    onRunEvaluationInput.mockClear();
    pendingEvaluation = new Promise<void>((resolve) => {
      completeEvaluation = resolve;
    });
    return () => completeEvaluation();
  },
  parameters: {
    msw: {
      handlers: [
        graphql.mutation<
          RunEvaluationInputMutation,
          RunEvaluationInputMutationVariables
        >('RunEvaluationInput', async ({ variables }) => {
          onRunEvaluationInput(variables);
          await pendingEvaluation;
          return HttpResponse.json({
            data: {
              runEvaluationInput: {
                id: 'evaluation-turn',
                threadId: 'evaluation-thread',
                agentId: variables.agentId,
                createdAt: '2026-09-23T00:00:00.000Z',
                evaluations: [],
              },
            },
          });
        }),
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof SettingsAgentEvalsTab>;

export const RunWhilePending: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'More options' });

    await userEvent.click(trigger);
    await userEvent.click(canvas.getByRole('menuitem', { name: 'Run' }));

    await waitFor(() =>
      expect(onRunEvaluationInput).toHaveBeenCalledWith({
        agentId: args.agentId,
        input: evaluationInput,
      }),
    );
    await waitFor(() =>
      expect(canvas.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await expect(
      canvas.getByRole('button', { name: 'More options' }),
    ).toHaveAttribute('aria-expanded', 'false');
  },
};

export const DeleteInput: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: 'More options' }));
    await userEvent.click(canvas.getByRole('menuitem', { name: 'Delete' }));

    const dialog = await canvas.findByRole('dialog', {
      name: 'Delete Evaluation Input',
    });
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Delete' }),
    );

    await waitFor(() =>
      expect(args.onEvaluationInputsChange).toHaveBeenCalledWith([]),
    );
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'More options' });

    await expect(trigger).toBeDisabled();
    await userEvent.click(trigger);

    await expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
    await expect(onRunEvaluationInput).not.toHaveBeenCalled();
  },
};
