import { WorkflowFindRecordsAction } from '@/workflow/types/Workflow';
import { WorkflowEditActionFindRecords } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowEditActionFindRecords';
import { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getWorkflowNodeIdMock } from '~/testing/mock-data/workflow';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';

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
  title: 'Modules/Workflow/WorkflowEditActionFindRecords',
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
    I18nFrontDecorator,
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

export const DisabledWithEmptyValues: Story = {
  args: {
    actionOptions: {
      readonly: true,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const titleText = await canvas.findByText('Search Records');

    expect(window.getComputedStyle(titleText).cursor).toBe('default');

    await userEvent.click(titleText);

    const titleInput = canvas.queryByDisplayValue('Search Records');
    expect(titleInput).not.toBeInTheDocument();

    const objectSelectCurrentValue = await canvas.findByText('People');

    await userEvent.click(objectSelectCurrentValue);

    {
      const searchInputInSelectDropdown =
        canvas.queryByPlaceholderText('Search');

      expect(searchInputInSelectDropdown).not.toBeInTheDocument();
    }
  },
};
