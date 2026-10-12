import { type WorkflowFormAction } from '@/workflow/types/Workflow';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { WorkflowEditActionFormBuilder } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowEditActionFormBuilder';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { FieldMetadataType } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getWorkflowNodeIdMock } from '~/testing/mock-data/workflow';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';

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
        value: 0,
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
    MemoryRouterDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
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

export const NonManualTrigger: Story = {
  args: {
    triggerType: 'DATABASE_EVENT',
    actionOptions: {
      onActionUpdate: fn(),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText('Forms are meant for manual triggers'),
    ).toBeVisible();
    expect(
      await canvas.findByText(/it only shows in the workflow run\./),
    ).toBeVisible();
    expect(canvas.queryByText(/Send to Inbox/)).not.toBeInTheDocument();
  },
};

export const NonManualTriggerWithSendToInbox: Story = {
  args: {
    triggerType: 'DATABASE_EVENT',
    actionOptions: {
      onActionUpdate: fn(),
    },
  },
  beforeEach: () => {
    const previousWorkspace = jotaiStore.get(currentWorkspaceState.atom);

    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      featureFlags: [
        {
          key: FeatureFlagKey.IS_WORKFLOW_SEND_CHAT_MESSAGE_ENABLED,
          value: true,
        },
      ],
    });

    return () => {
      jotaiStore.set(currentWorkspaceState.atom, previousWorkspace);
    };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(/use a Send to Inbox step instead\./),
    ).toBeVisible();
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
    const messageContainer = await canvas.findByText('Add inputs to your form');

    expect(messageContainer).toBeVisible();

    const addFieldButton = await canvas.findByText('Add Field');
    expect(addFieldButton).toBeVisible();
  },
};

export const WithInstructions: Story = {
  args: {
    action: {
      ...DEFAULT_ACTION,
      settings: {
        ...DEFAULT_ACTION.settings,
        instructions:
          'Review the deal with {{trigger.properties.after.name}} before the renewal call.',
      },
    },
    actionOptions: {
      onActionUpdate: fn(),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Instructions')).toBeVisible();
  },
};
