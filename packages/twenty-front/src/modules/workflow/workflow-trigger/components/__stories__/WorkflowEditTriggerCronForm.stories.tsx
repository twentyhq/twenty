import { type WorkflowCronTrigger } from '@/workflow/types/Workflow';
import { WorkflowEditTriggerCronExample } from '@/workflow/workflow-trigger/components/__stories__/WorkflowEditTriggerCronExample';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { CatalogDecorator } from 'twenty-ui/testing';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<typeof WorkflowEditTriggerCronExample> = {
  title: 'Modules/Workflow/Triggers/Cron/EditTrigger',
  component: WorkflowEditTriggerCronExample,
  parameters: {
    msw: graphqlMocks,
    catalog: { options: { elementContainer: { width: 420 } } },
  },
  args: {
    initialSettings: {
      type: 'DAYS',
      schedule: { day: 1, hour: 9, minute: 0 },
      outputSchema: {},
    },
  },
  decorators: [
    WorkflowStepActionDrawerDecorator,
    WorkflowStepDecorator,
    CatalogDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
    MemoryRouterDecorator,
    WorkspaceDecorator,
  ],
};
export default meta;
type Story = StoryObj<typeof WorkflowEditTriggerCronExample>;

export const InvalidNumericInput: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const hour = await canvas.findByRole('textbox', {
      name: 'Trigger at hour (UTC)',
    });
    await userEvent.clear(hour);
    await userEvent.type(hour, '24');
    await expect(hour).toHaveValue('24');
    await expect(canvas.getByText('Saved schedule: 0 9 */1 * *')).toBeVisible();
    await userEvent.clear(hour);
    await userEvent.type(hour, '10');
    await expect(
      canvas.getByText('Saved schedule: 0 10 */1 * *'),
    ).toBeVisible();
  },
};

export const InvalidCustomInput: Story = {
  args: {
    initialSettings: { type: 'CUSTOM', pattern: '0 9 * * 1', outputSchema: {} },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const expression = await canvas.findByRole('textbox', {
      name: 'Expression',
    });
    await userEvent.click(expression);
    await userEvent.clear(expression);
    await userEvent.type(expression, 'invalid');
    await expect(expression).toHaveValue('invalid');
    await expect(canvas.getByText('Saved schedule: 0 9 * * 1')).toBeVisible();
  },
};

export const RemoteScheduleRefresh: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Refresh schedule' }),
    );
    await expect(
      canvas.getByRole('textbox', { name: 'Hours between triggers' }),
    ).toHaveValue('2');
    await expect(
      canvas.getByRole('textbox', { name: 'Trigger at minute (UTC)' }),
    ).toHaveValue('15');
    await expect(
      canvas.queryByRole('textbox', { name: 'Days between triggers' }),
    ).not.toBeInTheDocument();
  },
};

export const ScheduleModes: Story = {
  parameters: {
    catalog: {
      dimensions: [
        {
          name: 'Interval',
          values: [
            {
              type: 'DAYS',
              schedule: { day: 1, hour: 9, minute: 0 },
              outputSchema: {},
            },
            {
              type: 'HOURS',
              schedule: { hour: 2, minute: 15 },
              outputSchema: {},
            },
            { type: 'MINUTES', schedule: { minute: 30 }, outputSchema: {} },
            { type: 'CUSTOM', pattern: '0 9 * * 1', outputSchema: {} },
          ],
          props: (initialSettings: WorkflowCronTrigger['settings']) => ({
            initialSettings,
          }),
        },
      ],
    },
  },
};
