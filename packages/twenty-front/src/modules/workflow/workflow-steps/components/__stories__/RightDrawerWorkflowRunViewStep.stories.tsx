import { flowState } from '@/workflow/states/flowState';
import { workflowRunIdState } from '@/workflow/states/workflowRunIdState';
import { workflowSelectedNodeState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeState';
import { TRIGGER_STEP_ID } from '@/workflow/workflow-trigger/constants/TriggerStepId';
import styled from '@emotion/styled';
import { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { HttpResponse, graphql } from 'msw';
import { useSetRecoilState } from 'recoil';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { oneFailedWorkflowRunQueryResult } from '~/testing/mock-data/workflow-run';
import { RightDrawerWorkflowRunViewStep } from '../RightDrawerWorkflowRunViewStep';

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 500px;
`;

const meta: Meta<typeof RightDrawerWorkflowRunViewStep> = {
  title: 'Modules/Workflow/RightDrawerWorkflowRunViewStep',
  component: RightDrawerWorkflowRunViewStep,
  decorators: [
    (Story) => (
      <StyledWrapper>
        <Story />
      </StyledWrapper>
    ),
    I18nFrontDecorator,
    ComponentDecorator,
    (Story) => {
      const setFlow = useSetRecoilState(flowState);
      const setWorkflowSelectedNode = useSetRecoilState(
        workflowSelectedNodeState,
      );
      const setWorkflowRunId = useSetRecoilState(workflowRunIdState);

      setFlow({
        workflowVersionId:
          oneFailedWorkflowRunQueryResult.workflowRun.workflowVersionId,
        trigger:
          oneFailedWorkflowRunQueryResult.workflowRun.output.flow.trigger,
        steps: oneFailedWorkflowRunQueryResult.workflowRun.output.flow.steps,
      });
      setWorkflowSelectedNode(
        oneFailedWorkflowRunQueryResult.workflowRun.output.flow.steps[0].id,
      );
      setWorkflowRunId(oneFailedWorkflowRunQueryResult.workflowRun.id);

      return <Story />;
    },
    RouterDecorator,
    ObjectMetadataItemsDecorator,
    WorkspaceDecorator,
    WorkflowStepDecorator,
  ],
  parameters: {
    msw: {
      handlers: [
        graphql.query('FindOneWorkflowRun', () => {
          const workflowRunContext =
            oneFailedWorkflowRunQueryResult.workflowRun.context;

          // Rendering the whole objectMetadata information in the JSON viewer is too long for storybook
          // so we remove it for the story
          return HttpResponse.json({
            data: {
              ...oneFailedWorkflowRunQueryResult,
              workflowRun: {
                ...oneFailedWorkflowRunQueryResult.workflowRun,
                context: {
                  ...workflowRunContext,
                  trigger: {
                    ...workflowRunContext.trigger,
                    objectMetadata: undefined,
                  },
                },
              },
            },
          });
        }),
        ...graphqlMocks.handlers,
      ],
    },
  },
};

export default meta;

type Story = StoryObj<typeof RightDrawerWorkflowRunViewStep>;

export const NodeTab: Story = {};

export const InputTab: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByRole('button', { name: 'Input' }));

    expect(await canvas.findByText('Trigger')).toBeVisible();
  },
};

export const InputTabDisabledForTrigger: Story = {
  decorators: [
    (Story) => {
      const setWorkflowSelectedNode = useSetRecoilState(
        workflowSelectedNodeState,
      );

      setWorkflowSelectedNode(TRIGGER_STEP_ID);

      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const inputTab = await canvas.findByRole('button', { name: 'Input' });

    expect(inputTab).toBeDisabled();
  },
};

export const InputTabNotExecutedStep: Story = {
  decorators: [
    (Story) => {
      const setWorkflowSelectedNode = useSetRecoilState(
        workflowSelectedNodeState,
      );

      setWorkflowSelectedNode(
        oneFailedWorkflowRunQueryResult.workflowRun.output.flow.steps.at(-1)!
          .id,
      );

      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const inputTab = await canvas.findByRole('button', { name: 'Input' });

    expect(inputTab).toBeDisabled();
  },
};

export const OutputTab: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Output' }),
    );

    await waitFor(() => {
      expect(canvas.queryByText('Create Record')).not.toBeInTheDocument();
    });

    expect(await canvas.findByText('result')).toBeVisible();
  },
};

export const OutputTabDisabledForTrigger: Story = {
  decorators: [
    (Story) => {
      const setWorkflowSelectedNode = useSetRecoilState(
        workflowSelectedNodeState,
      );

      setWorkflowSelectedNode(TRIGGER_STEP_ID);

      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const outputTab = await canvas.findByRole('button', { name: 'Output' });

    expect(outputTab).toBeDisabled();
  },
};

export const OutputTabNotExecutedStep: Story = {
  decorators: [
    (Story) => {
      const setWorkflowSelectedNode = useSetRecoilState(
        workflowSelectedNodeState,
      );

      setWorkflowSelectedNode(
        oneFailedWorkflowRunQueryResult.workflowRun.output.flow.steps.at(-1)!
          .id,
      );

      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const outputTab = await canvas.findByRole('button', { name: 'Output' });

    expect(outputTab).toBeDisabled();
  },
};
