import { WorkflowVariablesDropdown } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdown';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from 'twenty-ui/input';
import { ComponentDecorator } from 'twenty-ui/testing';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta = {
  title: 'Modules/Workflow/Variables/WorkflowVariablesDropdown',
  component: WorkflowVariablesDropdown,
  parameters: {
    msw: graphqlMocks,
  },
  args: {
    instanceId: 'variables',
    onVariableSelect: fn(),
    shouldDisplayRecordFields: true,
    shouldDisplayRecordObjects: false,
    clickableComponent: <Button title="Open variables" />,
  },
  decorators: [WorkflowStepDecorator, ComponentDecorator, WorkspaceDecorator],
} satisfies Meta<typeof WorkflowVariablesDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SearchNestedFieldFromAutoOpenedStep: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByText('Open variables', undefined, { timeout: 5_000 }),
    );
    expect(await body.findByText('Record Fields')).toBeInTheDocument();
    expect(body.queryByText(' Address City')).not.toBeInTheDocument();
    await userEvent.type(await body.findByRole('textbox'), ' ADDRESS CITY ');
    await userEvent.click(await body.findByText(' Address City'));
    expect(args.onVariableSelect).toHaveBeenCalledWith(
      '{{trigger.properties.after.fields.address.addressCity}}',
    );
  },
};
