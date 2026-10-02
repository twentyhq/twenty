import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { Dropdown } from 'twenty-ui/components';
import { Button } from 'twenty-ui/primitives/input';
import { WorkflowVariablesDropdownStepItems } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdownStepItems';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';

const ASYNC_DECORATOR_WAIT_OPTIONS = { timeout: 5_000 };

const meta = {
  title: 'Modules/Workflow/Variables/WorkflowVariablesDropdownStepItems',
  component: WorkflowVariablesDropdownStepItems,
  render: (args) => (
    <DropdownRoot dropdownId="workflow-variables-story" type="picker">
      <Dropdown.Trigger render={<Button title="Open variables" />} />
      <DropdownContent width={320}>
        <WorkflowVariablesDropdownStepItems {...args} />
      </DropdownContent>
    </DropdownRoot>
  ),
  args: {
    step: {
      id: 'code',
      name: 'Run code',
      type: 'CODE',
      outputSchema: {
        result: {
          isLeaf: false,
          type: 'object',
          label: 'Result',
          value: {
            employees: {
              isLeaf: true,
              label: 'Employees',
              type: 'number',
              value: 5,
            },
          },
        },
      },
    },
    onSelect: fn(),
    onBack: fn(),
    shouldDisplayRecordObjects: false,
  },
  decorators: [WorkflowStepDecorator, ComponentDecorator, WorkspaceDecorator],
} satisfies Meta<typeof WorkflowVariablesDropdownStepItems>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NestedFieldSearch: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(
      await within(canvasElement).findByRole('button', {
        name: 'Open variables',
      }),
    );
    const canvas = within(canvasElement.ownerDocument.body);

    const searchInput = await canvas.findByRole(
      'searchbox',
      undefined,
      ASYNC_DECORATOR_WAIT_OPTIONS,
    );

    expect(canvas.getByText('Result')).toBeInTheDocument();
    expect(canvas.queryByText('Employees')).not.toBeInTheDocument();
    await userEvent.type(searchInput, ' EMPLOYEES ');
    expect(
      canvas.getByText('Run code / Result', { exact: false }),
    ).toBeInTheDocument();
    await userEvent.click(canvas.getByText('Employees'));
    expect(args.onSelect).toHaveBeenCalledWith('{{code.result.employees}}');
  },
};
