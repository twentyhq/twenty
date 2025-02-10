import { WorkflowUpdateRecordAction } from '@/workflow/types/Workflow';
import { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getPeopleMock } from '~/testing/mock-data/people';
import { getWorkflowNodeIdMock } from '~/testing/mock-data/workflow';
import { WorkflowEditActionFormUpdateRecord } from '../WorkflowEditActionFormUpdateRecord';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';

const DEFAULT_ACTION = {
  id: getWorkflowNodeIdMock(),
  name: 'Update Record',
  type: 'UPDATE_RECORD',
  settings: {
    input: {
      objectName: 'person',
      objectRecordId: '',
      objectRecord: {},
      fieldsToUpdate: [
        'updatedAt',
        'averageEstimatedNumberOfAtomsInTheUniverse',
        'comments',
        'createdAt',
        'deletedAt',
        'name',
        'participants',
        'percentageOfCompletion',
        'score',
        'shortNotes',
      ],
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
  valid: false,
} satisfies WorkflowUpdateRecordAction;

const meta: Meta<typeof WorkflowEditActionFormUpdateRecord> = {
  title: 'Modules/Workflow/WorkflowEditActionFormUpdateRecord',
  component: WorkflowEditActionFormUpdateRecord,
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

type Story = StoryObj<typeof WorkflowEditActionFormUpdateRecord>;

export const Default: Story = {
  args: {
    actionOptions: {
      onActionUpdate: fn(),
    },
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

    const titleInput = await canvas.findByDisplayValue('Update Record');

    expect(titleInput).toBeDisabled();

    const objectSelectCurrentValue = await canvas.findByText('People');

    await userEvent.click(objectSelectCurrentValue);

    {
      const searchInputInSelectDropdown =
        canvas.queryByPlaceholderText('Search');

      expect(searchInputInSelectDropdown).not.toBeInTheDocument();
    }

    const openRecordSelectButton = within(
      await canvas.findByTestId(
        'workflow-edit-action-record-update-object-record-id',
      ),
    ).queryByRole('button');

    expect(openRecordSelectButton).not.toBeInTheDocument();

    const firstSelectedUpdatableField = await within(
      await canvas.findByTestId(
        'workflow-edit-action-record-update-fields-to-update',
      ),
    ).findByText('Creation date');

    await userEvent.click(firstSelectedUpdatableField);

    {
      const searchInputInSelectDropdown =
        canvas.queryByPlaceholderText('Search');

      expect(searchInputInSelectDropdown).not.toBeInTheDocument();
    }
  },
};

const peopleMock = getPeopleMock()[0];

export const DisabledWithDefaultStaticValues: Story = {
  args: {
    action: {
      ...DEFAULT_ACTION,
      settings: {
        ...DEFAULT_ACTION.settings,
        input: {
          ...DEFAULT_ACTION.settings.input,
          objectRecordId: peopleMock.id,
        },
      },
    },
    actionOptions: {
      readonly: true,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const titleInput = await canvas.findByDisplayValue('Update Record');

    expect(titleInput).toBeDisabled();

    const objectSelectCurrentValue = await canvas.findByText('People');

    await userEvent.click(objectSelectCurrentValue);

    {
      const searchInputInSelectDropdown =
        canvas.queryByPlaceholderText('Search');

      expect(searchInputInSelectDropdown).not.toBeInTheDocument();
    }

    const selectedRecord = await canvas.findByText(
      `${peopleMock.name.firstName} ${peopleMock.name.lastName}`,
    );
    expect(selectedRecord).toBeVisible();

    const openRecordSelectButton = within(
      await canvas.findByTestId(
        'workflow-edit-action-record-update-object-record-id',
      ),
    ).queryByRole('button');

    expect(openRecordSelectButton).not.toBeInTheDocument();

    const firstSelectedUpdatableField = await within(
      await canvas.findByTestId(
        'workflow-edit-action-record-update-fields-to-update',
      ),
    ).findByText('Creation date');

    await userEvent.click(firstSelectedUpdatableField);

    {
      const searchInputInSelectDropdown =
        canvas.queryByPlaceholderText('Search');

      expect(searchInputInSelectDropdown).not.toBeInTheDocument();
    }
  },
};

export const DisabledWithDefaultVariableValues: Story = {
  args: {
    action: {
      ...DEFAULT_ACTION,
      settings: {
        ...DEFAULT_ACTION.settings,
        input: {
          ...DEFAULT_ACTION.settings.input,
          objectRecordId: '{{trigger.recordId}}',
        },
      },
    },
    actionOptions: {
      readonly: true,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const titleInput = await canvas.findByDisplayValue('Update Record');

    expect(titleInput).toBeDisabled();

    const objectSelectCurrentValue = await canvas.findByText('People');

    await userEvent.click(objectSelectCurrentValue);

    {
      const searchInputInSelectDropdown =
        canvas.queryByPlaceholderText('Search');

      expect(searchInputInSelectDropdown).not.toBeInTheDocument();
    }

    const openRecordSelectButton = within(
      await canvas.findByTestId(
        'workflow-edit-action-record-update-object-record-id',
      ),
    ).queryByRole('button');

    expect(openRecordSelectButton).not.toBeInTheDocument();

    const firstSelectedUpdatableField = await within(
      await canvas.findByTestId(
        'workflow-edit-action-record-update-fields-to-update',
      ),
    ).findByText('Creation date');

    await userEvent.click(firstSelectedUpdatableField);

    {
      const searchInputInSelectDropdown =
        canvas.queryByPlaceholderText('Search');

      expect(searchInputInSelectDropdown).not.toBeInTheDocument();
    }
  },
};
