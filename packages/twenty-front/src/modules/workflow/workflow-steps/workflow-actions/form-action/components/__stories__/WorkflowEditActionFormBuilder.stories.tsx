import { type WorkflowFormAction } from '@/workflow/types/Workflow';
import { WorkflowEditActionFormBuilder } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowEditActionFormBuilder';
import { type Meta, type StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { FieldMetadataType } from 'twenty-shared/types';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getWorkflowNodeIdMock } from '~/testing/mock-data/workflow';

const DEFAULT_ACTION = {
  id: getWorkflowNodeIdMock(),
  name: 'Form',
  type: 'FORM',
  valid: false,
  settings: {
    input: [
      {
        id: 'ed00b897-519f-44cd-8201-a6502a3a9dc8',
        name: 'company',
        type: FieldMetadataType.TEXT,
        label: 'Company',
        placeholder: 'Select a company',
        settings: {},
      },
      {
        id: 'ed00b897-519f-44cd-8201-a6502a3a9dc9',
        name: 'number',
        type: FieldMetadataType.NUMBER,
        label: 'Number',
        placeholder: '1000',
        settings: {},
      },
    ],
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
} satisfies WorkflowFormAction;

const meta: Meta<typeof WorkflowEditActionFormBuilder> = {
  title: 'Modules/Workflow/Actions/Form/WorkflowEditActionFormBuilder',
  component: WorkflowEditActionFormBuilder,
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
    RouterDecorator,
    I18nFrontDecorator,
    ObjectMetadataItemsDecorator,
  ],
};

export default meta;

type Story = StoryObj<typeof WorkflowEditActionFormBuilder>;

export const Default: Story = {
  args: {
    actionOptions: {
      onActionUpdate: fn(),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Company');
    await canvas.findByText('Add Field');
  },
};

export const DeleteFields: Story = {
  args: {
    actionOptions: {
      onActionUpdate: fn(),
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const companyInput = await canvas.findByText('Company');

    await userEvent.hover(companyInput);

    const deleteButton = await canvas.findByRole('button', {
      name: 'Delete field',
    });

    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(canvas.queryByText('Company')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      const actionOptions = args.actionOptions as typeof args.actionOptions & {
        readonly?: false;
      };

      expect(actionOptions.onActionUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          settings: expect.objectContaining({
            input: [
              {
                id: 'ed00b897-519f-44cd-8201-a6502a3a9dc9',
                name: 'number',
                type: FieldMetadataType.NUMBER,
                label: 'Number',
                placeholder: '1000',
                settings: {},
              },
            ],
          }),
        }),
      );
    });
  },
};
export const OpenFieldSettings: Story = {
  args: {
    actionOptions: {
      onActionUpdate: fn(),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const companyInput = await canvas.findByText('Select a company');

    await userEvent.click(companyInput);

    const inputSettingsLabel = await canvas.findByText('Input settings');

    expect(inputSettingsLabel).toBeVisible();
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

    await canvas.findByText('Company');

    const addFieldButton = canvas.queryByText('Add Field');
    expect(addFieldButton).not.toBeInTheDocument();
  },
};

export const EmptyForm: Story = {
  args: {
    actionOptions: {
      onActionUpdate: fn(),
    },
    action: {
      ...DEFAULT_ACTION,
      settings: {
        ...DEFAULT_ACTION.settings,
        input: [],
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const messageContainer = await canvas.findByTestId(
      'empty-form-message-title',
    );

    expect(messageContainer).toBeVisible();

    const addFieldButton = await canvas.findByText('Add Field');
    expect(addFieldButton).toBeVisible();
  },
};
