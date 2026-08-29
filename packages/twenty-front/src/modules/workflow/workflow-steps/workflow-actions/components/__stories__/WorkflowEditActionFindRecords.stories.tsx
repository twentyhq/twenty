import { type WorkflowFindRecordsAction } from '@/workflow/types/Workflow';
import { WorkflowEditActionFindRecords } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowEditActionFindRecords';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getWorkflowNodeIdMock } from '~/testing/mock-data/workflow';

const DEFAULT_ACTION = {
  id: getWorkflowNodeIdMock(),
  name: 'Search Records',
  type: 'FIND_RECORDS',
  valid: false,
  settings: {
    input: {
      objectName: 'person',
      limit: 1,
    },
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: {
        value: false,
      },
      continueOnFailure: {
        value: false,
      },
    },
  },
} satisfies WorkflowFindRecordsAction;

const meta: Meta<typeof WorkflowEditActionFindRecords> = {
  title: 'Modules/Workflow/Actions/FindRecords/EditAction',
  component: WorkflowEditActionFindRecords,
  parameters: {
    msw: graphqlMocks,
  },
  args: {
    action: DEFAULT_ACTION,
  },
  decorators: [
    WorkflowStepActionDrawerDecorator,
    WorkflowStepDecorator,
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
    RouterDecorator,
    WorkspaceDecorator,
  ],
};

export default meta;

type Story = StoryObj<typeof WorkflowEditActionFindRecords>;

export const Default: Story = {
  args: {
    actionOptions: {
      onActionUpdate: fn(),
    },
  },
};

const onActionUpdateMock = fn();

export const KeepsLimitAndOffsetWhenObjectChanges: Story = {
  args: {
    action: {
      ...DEFAULT_ACTION,
      settings: {
        ...DEFAULT_ACTION.settings,
        input: {
          objectName: 'person',
          limit: 100,
          offset: 20,
        },
      },
    },
    actionOptions: {
      onActionUpdate: onActionUpdateMock,
    },
  },
  play: async ({ canvasElement }) => {
    onActionUpdateMock.mockClear();

    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByText('People'));

    await userEvent.type(
      await screen.findByPlaceholderText('Search'),
      'Companies',
    );

    await userEvent.click(await screen.findByText('Companies'));

    await waitFor(
      () => {
        expect(onActionUpdateMock).toHaveBeenCalledWith(
          expect.objectContaining({
            settings: expect.objectContaining({
              input: expect.objectContaining({
                objectName: 'company',
                limit: 100,
                offset: 20,
              }),
            }),
          }),
        );
      },
      { timeout: 3000 },
    );
  },
};

export const DisabledWithEmptyValues: Story = {
  args: {
    actionOptions: {
      readonly: true,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const objectSelectCurrentValue = await canvas.findByText('People');

    await userEvent.click(objectSelectCurrentValue);

    {
      const searchInputInSelectDropdown =
        canvas.queryByPlaceholderText('Search');

      expect(searchInputInSelectDropdown).not.toBeInTheDocument();
    }
  },
};
