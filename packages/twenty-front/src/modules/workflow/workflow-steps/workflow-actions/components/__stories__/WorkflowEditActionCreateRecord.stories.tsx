import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within } from '@storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getWorkflowNodeIdMock } from '~/testing/mock-data/workflow';
import { WorkflowEditActionCreateRecord } from '../WorkflowEditActionCreateRecord';

const meta: Meta<typeof WorkflowEditActionCreateRecord> = {
  title: 'Modules/Workflow/Actions/CreateRecord/EditAction',
  component: WorkflowEditActionCreateRecord,
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
    I18nFrontDecorator,
  ],
};

export default meta;

type Story = StoryObj<typeof WorkflowEditActionCreateRecord>;

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

    const titleText = await canvas.findByText('Create Record');

    expect(window.getComputedStyle(titleText).cursor).toBe('default');

    await userEvent.click(titleText);

    const titleInput = canvas.queryByDisplayValue('Create Record');
    expect(titleInput).not.toBeInTheDocument();

    const objectSelectCurrentValue = await canvas.findByText('People');

    await userEvent.click(objectSelectCurrentValue);

    const searchInputInSelectDropdown = canvas.queryByPlaceholderText('Search');

    expect(searchInputInSelectDropdown).not.toBeInTheDocument();
  },
};
