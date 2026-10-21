import { type WorkflowDatabaseEventTrigger } from '@/workflow/types/Workflow';
import { WorkflowEditTriggerDatabaseEventForm } from '@/workflow/workflow-trigger/components/WorkflowEditTriggerDatabaseEventForm';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const DEFAULT_TRIGGER: WorkflowDatabaseEventTrigger = {
  name: 'Record is created',
  type: 'DATABASE_EVENT',
  settings: { eventName: 'person.created', outputSchema: {} },
};

const onTriggerUpdate = fn();

const meta: Meta<typeof WorkflowEditTriggerDatabaseEventForm> = {
  title: 'Modules/Workflow/Triggers/DatabaseEvent/EditTrigger',
  component: WorkflowEditTriggerDatabaseEventForm,
  parameters: { msw: graphqlMocks },
  args: {
    trigger: DEFAULT_TRIGGER,
    triggerOptions: { onTriggerUpdate },
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

type Story = StoryObj<typeof WorkflowEditTriggerDatabaseEventForm>;

export const SelectRecordTypeWithKeyboard: Story = {
  play: async ({ canvasElement }) => {
    onTriggerUpdate.mockClear();
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'People' }),
    );
    await userEvent.type(
      await screen.findByRole('searchbox', { name: 'Search' }),
      'Companies',
    );
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: 'Record Type' }),
      ).not.toBeInTheDocument();
      expect(onTriggerUpdate).toHaveBeenCalledWith({
        ...DEFAULT_TRIGGER,
        settings: { ...DEFAULT_TRIGGER.settings, eventName: 'company.created' },
      });
    });
  },
};

export const ReadOnly: Story = {
  args: { triggerOptions: { readonly: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByText('People'));

    expect(
      canvas.queryByRole('button', { name: 'People' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('dialog', { name: 'Record Type' }),
    ).not.toBeInTheDocument();
  },
};
