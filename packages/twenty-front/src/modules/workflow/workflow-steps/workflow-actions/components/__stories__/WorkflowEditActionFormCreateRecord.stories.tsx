import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within } from '@storybook/test';
import { ComponentDecorator } from 'twenty-ui';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getWorkflowNodeIdMock } from '~/testing/mock-data/workflow';
import { WorkflowEditActionFormCreateRecord } from '../WorkflowEditActionFormCreateRecord';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';

const meta: Meta<typeof WorkflowEditActionFormCreateRecord> = {
  title: 'Modules/Workflow/WorkflowEditActionFormCreateRecord',
  component: WorkflowEditActionFormCreateRecord,
  parameters: {
    msw: graphqlMocks,
  },
  args: {
    action: {
      id: getWorkflowNodeIdMock(),
      name: 'Create Record',
      type: 'CREATE_RECORD',
      valid: false,
      settings: {
        input: {
          objectName: 'person',
          objectRecord: {},
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
    },
  },
  decorators: [
    WorkflowStepActionDrawerDecorator,
    WorkflowStepDecorator,
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
    WorkspaceDecorator,
  ],
};

export default meta;

type Story = StoryObj<typeof WorkflowEditActionFormCreateRecord>;

export const Default: Story = {
  args: {
    actionOptions: {
      onActionUpdate: fn(),
    },
  },
};

export const Disabled: Story = {
  args: {
    actionOptions: {
      readonly: true,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const titleInput = await canvas.findByDisplayValue('Create Record');

    expect(titleInput).toBeDisabled();

    const objectSelectCurrentValue = await canvas.findByText('People');

    await userEvent.click(objectSelectCurrentValue);

    const searchInputInSelectDropdown = canvas.queryByPlaceholderText('Search');

    expect(searchInputInSelectDropdown).not.toBeInTheDocument();
  },
};
