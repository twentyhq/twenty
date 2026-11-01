import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { CoreWorkflowChip } from '@/object-core/workflows/components/CoreWorkflowChip';
import { CoreWorkflowStatus, WorkflowVisibility } from '~/generated/graphql';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';

const CORE_WORKFLOW_ID = '20202020-0000-4000-8000-000000000002';

const meta: Meta<typeof CoreWorkflowChip> = {
  title: 'Modules/ObjectCore/Workflows/CoreWorkflowChip',
  component: CoreWorkflowChip,
  decorators: [ComponentDecorator, MemoryRouterDecorator],
  args: {
    coreRecordId: CORE_WORKFLOW_ID,
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query('GetCoreWorkflow', () =>
          HttpResponse.json({
            data: {
              coreWorkflow: {
                __typename: 'CoreWorkflowDTO',
                id: CORE_WORKFLOW_ID,
                name: 'Lead enrichment',
                statuses: [CoreWorkflowStatus.ACTIVE],
                lastPublishedCoreWorkflowVersionId: null,
                applicationId: null,
                workspaceWorkflowId: null,
                visibility: WorkflowVisibility.WORKSPACE,
                canChangeVisibility: true,
                createdAt: '2026-10-01T10:00:00.000Z',
                updatedAt: '2026-10-01T10:00:00.000Z',
              },
            },
          }),
        ),
      ],
    },
  },
};

export default meta;

type Story = StoryObj<typeof CoreWorkflowChip>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const workflowLink = await canvas.findByRole('link', {
      name: /Lead enrichment/,
    });

    await expect(workflowLink).toHaveAttribute(
      'href',
      `/workflow/${CORE_WORKFLOW_ID}`,
    );
  },
};
