import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, within } from 'storybook/test';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';

import { CoreWorkflowRunWorkflowFieldDisplay } from '@/object-core/workflows/components/CoreWorkflowRunWorkflowFieldDisplay';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { CoreWorkflowStatus, WorkflowVisibility } from '~/generated/graphql';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';

const WORKFLOW_RUN_ID = '20202020-0000-4000-8000-000000000001';
const CORE_WORKFLOW_ID = '20202020-0000-4000-8000-000000000002';

const renderWorkflowRunWorkflowField = (coreWorkflowId: string | null) => {
  jotaiStore.set(recordStoreFamilyState.atomFamily(WORKFLOW_RUN_ID), {
    __typename: 'WorkflowRun',
    id: WORKFLOW_RUN_ID,
    workflow: null,
    coreWorkflowId,
  });

  return (
    <FieldContext.Provider
      value={{
        recordId: WORKFLOW_RUN_ID,
        isLabelIdentifier: false,
        isRecordFieldReadOnly: true,
        fieldDefinition: {
          fieldMetadataId: 'workflow-field-metadata-id',
          label: 'Workflow',
          iconName: 'IconSettingsAutomation',
          type: FieldMetadataType.RELATION,
          metadata: {
            fieldName: 'workflow',
            objectMetadataNameSingular: CoreObjectNameSingular.WorkflowRun,
          },
        },
      }}
    >
      <CoreWorkflowRunWorkflowFieldDisplay />
    </FieldContext.Provider>
  );
};

const meta: Meta<typeof CoreWorkflowRunWorkflowFieldDisplay> = {
  title: 'Modules/ObjectCore/Workflows/CoreWorkflowRunWorkflowFieldDisplay',
  component: CoreWorkflowRunWorkflowFieldDisplay,
  decorators: [ComponentDecorator, MemoryRouterDecorator],
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

type Story = StoryObj<typeof CoreWorkflowRunWorkflowFieldDisplay>;

export const WithCoreWorkflow: Story = {
  render: () => renderWorkflowRunWorkflowField(CORE_WORKFLOW_ID),
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

export const WithoutCoreWorkflow: Story = {
  render: () => renderWorkflowRunWorkflowField(null),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByRole('link')).not.toBeInTheDocument();
  },
};
