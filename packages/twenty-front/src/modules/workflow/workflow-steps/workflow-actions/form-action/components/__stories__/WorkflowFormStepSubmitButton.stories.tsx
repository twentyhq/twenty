import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Toaster } from 'twenty-ui/components';
import { ComponentDecorator } from 'twenty-ui/testing';

import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
import { WorkflowFormStepSubmitButton } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowFormStepSubmitButton';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { oneSucceededWorkflowRunQueryResult } from '~/testing/mock-data/workflow-run';
import { mockedApolloCoreClient } from '~/testing/mockedApolloCoreClient';
import { mockedApolloClient } from '~/testing/mockedApolloClient';

const WORKFLOW_RUN_ID = oneSucceededWorkflowRunQueryResult.workflowRun.id;
const STEP_ID = '212a171a-f887-4213-8892-e39c2a3ecc30';
const THREAD_ID = 'a19e36a1-e3bb-4fa0-8317-79c7e938849e';

const FormSubmission = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const workflowRun = useWorkflowRun({ workflowRunId: WORKFLOW_RUN_ID });

  if (isSubmitted) {
    return <div>Form submitted</div>;
  }

  if (!workflowRun) {
    return <div>Loading form</div>;
  }

  return (
    <>
      <WorkflowFormStepSubmitButton
        workflowRunId={WORKFLOW_RUN_ID}
        stepId={STEP_ID}
        disabled={false}
        getResponse={async () => ({ name: 'Tim' })}
        onSubmitted={() => setIsSubmitted(true)}
      />
      <Toaster />
    </>
  );
};

const createHandlers = ({
  threadId,
  errorCode,
}: {
  threadId?: string;
  errorCode?: string;
} = {}) => [
  graphql.query('FindOneWorkflowRun', () =>
    HttpResponse.json({
      data: {
        workflowRun: {
          ...oneSucceededWorkflowRunQueryResult.workflowRun,
          status: 'RUNNING',
          endedAt: null,
          enqueuedAt: null,
          updatedBy: null,
          createdBy: {
            ...oneSucceededWorkflowRunQueryResult.workflowRun.createdBy,
            context: { provider: null },
          },
          state: {
            ...oneSucceededWorkflowRunQueryResult.workflowRun.state,
            stepInfos: { [STEP_ID]: { status: 'PENDING', threadId } },
          },
        },
      },
    }),
  ),
  graphql.mutation(threadId ? 'AnswerToolCall' : 'SubmitFormStep', () =>
    HttpResponse.json(
      errorCode
        ? {
            errors: [
              {
                message: 'Unable to submit form',
                extensions: {
                  code: errorCode,
                  userFriendlyMessage: 'Unable to submit form',
                },
              },
            ],
          }
        : {
            data: threadId
              ? {
                  answerToolCall: {
                    __typename: 'AnswerToolCallResult',
                    streamId: null,
                  },
                }
              : { submitFormStep: true },
          },
    ),
  ),
  ...graphqlMocks.handlers,
];

const meta: Meta<typeof FormSubmission> = {
  title: 'Modules/Workflow/Actions/Form/WorkflowFormStepSubmitButton',
  component: FormSubmission,
  decorators: [
    ComponentDecorator,
    MemoryRouterDecorator,
    ObjectMetadataItemsDecorator,
    WorkspaceDecorator,
    ToastDecorator,
  ],
  beforeEach: async () => {
    await Promise.all([
      mockedApolloClient.clearStore(),
      mockedApolloCoreClient.clearStore(),
    ]);
  },
  parameters: { msw: { handlers: createHandlers() } },
};

export default meta;
type Story = StoryObj<typeof FormSubmission>;

export const WithoutConversation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('button', { name: /Submit/ }),
    );
    expect(await canvas.findByText('Form submitted')).toBeVisible();
  },
};

export const WithConversation: Story = {
  parameters: { msw: { handlers: createHandlers({ threadId: THREAD_ID }) } },
  play: WithoutConversation.play,
};

export const NoLongerPending: Story = {
  parameters: {
    msw: { handlers: createHandlers({ errorCode: 'TOOL_CALL_NOT_PENDING' }) },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('button', { name: /Submit/ }),
    );
    expect(
      await within(document.body).findByText(
        'This form no longer waits for an answer',
      ),
    ).toBeVisible();
    expect(canvas.queryByText('Form submitted')).not.toBeInTheDocument();
    expect(canvas.getByRole('button', { name: /Submit/ })).toBeEnabled();
  },
};

export const SubmissionError: Story = {
  parameters: {
    msw: {
      handlers: createHandlers({ errorCode: 'TOOL_CALL_RESOLUTION_FORBIDDEN' }),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('button', { name: /Submit/ }),
    );
    expect(
      await within(document.body).findByText('Unable to submit form'),
    ).toBeVisible();
    expect(canvas.queryByText('Form submitted')).not.toBeInTheDocument();
    expect(canvas.getByRole('button', { name: /Submit/ })).toBeEnabled();
  },
};
