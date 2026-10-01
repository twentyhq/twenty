import { type WorkflowPickRecordAction } from '@/workflow/types/Workflow';
import { WorkflowEditActionPickRecord } from '@/workflow/workflow-steps/workflow-actions/pick-record-action/components/WorkflowEditActionPickRecord';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';
import { ComponentDecorator } from 'twenty-ui/testing';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedCompanyRecords } from '~/testing/mock-data/generated/data/companies/mock-companies-data';
import { getWorkflowNodeIdMock } from '~/testing/mock-data/workflow';

const DEFAULT_ACTION: WorkflowPickRecordAction = {
  id: getWorkflowNodeIdMock(),
  name: 'Pick Record',
  type: 'PICK_RECORD',
  valid: true,
  settings: {
    input: {
      objectName: 'company',
      strategy: 'RANDOM',
      recordIds: [mockedCompanyRecords[0].id],
      loadBalance: { objectNameSingular: 'person', fieldName: 'company' },
    },
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: 0 },
      continueOnFailure: { value: false },
    },
  },
};

const onActionUpdate = fn();

const meta: Meta<typeof WorkflowEditActionPickRecord> = {
  title: 'Modules/Workflow/Actions/PickRecord/EditAction',
  component: WorkflowEditActionPickRecord,
  parameters: { msw: graphqlMocks },
  args: {
    action: DEFAULT_ACTION,
    actionOptions: { onActionUpdate },
  },
  decorators: [
    WorkflowStepActionDrawerDecorator,
    WorkflowStepDecorator,
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
    MemoryRouterDecorator,
    WorkspaceDecorator,
  ],
};

export default meta;

type Story = StoryObj<typeof WorkflowEditActionPickRecord>;

export const ObjectAndLoadBalanceSelection: Story = {
  play: async ({ canvasElement }) => {
    onActionUpdate.mockClear();
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Strategy')).toBeVisible();
    expect(canvas.queryByText('Balance by')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Random' }));
    await userEvent.click(
      await screen.findByRole('button', { name: 'Load balanced' }),
    );

    expect(await canvas.findByText('Balance by')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Companies' }));
    await userEvent.type(
      await screen.findByRole('searchbox', { name: 'Search' }),
      'person',
    );
    await userEvent.keyboard('{Enter}');

    await waitFor(
      () => {
        expect(
          screen.queryByRole('dialog', { name: 'Object' }),
        ).not.toBeInTheDocument();
        expect(onActionUpdate).toHaveBeenLastCalledWith(
          expect.objectContaining({
            settings: expect.objectContaining({
              input: {
                objectName: 'person',
                strategy: 'LOAD_BALANCED',
                recordIds: [],
                loadBalance: { objectNameSingular: 'person', fieldName: '' },
              },
            }),
          }),
        );
      },
      { timeout: 3000 },
    );

    const balanceByField = canvas.getByText('Balance by').parentElement;

    if (!isDefined(balanceByField)) {
      throw new Error('The balance by field is missing');
    }

    await userEvent.click(
      within(balanceByField).getByRole('button', { name: 'People' }),
    );
    await userEvent.type(
      await screen.findByRole('searchbox', { name: 'Search' }),
      'company',
    );
    await userEvent.keyboard('{ArrowDown}{Enter}');

    await waitFor(
      () => {
        expect(
          screen.queryByRole('dialog', { name: 'Balance by' }),
        ).not.toBeInTheDocument();
        expect(onActionUpdate).toHaveBeenLastCalledWith(
          expect.objectContaining({
            settings: expect.objectContaining({
              input: expect.objectContaining({
                loadBalance: { objectNameSingular: 'company', fieldName: '' },
              }),
            }),
          }),
        );
      },
      { timeout: 3000 },
    );
  },
};
