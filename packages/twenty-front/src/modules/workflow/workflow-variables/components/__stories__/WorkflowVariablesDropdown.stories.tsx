import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { WorkflowVariablesDropdown } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdown';
import { SEARCH_VARIABLES_DROPDOWN_ID } from '@/workflow/workflow-variables/constants/SearchVariablesDropdownId';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const DROPDOWN_ID = `${SEARCH_VARIABLES_DROPDOWN_ID}-variables`;

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
  },
  beforeEach: () => {
    jotaiStore.set(
      isDropdownOpenComponentState.atomFamily({ instanceId: DROPDOWN_ID }),
      true,
    );
  },
  decorators: [WorkflowStepDecorator, ComponentDecorator, WorkspaceDecorator],
} satisfies Meta<typeof WorkflowVariablesDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SearchNestedFieldFromAutoOpenedStep: Story = {
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);

    expect(await body.findByText('Record Fields')).toBeInTheDocument();
    expect(body.queryByText(' Address City')).not.toBeInTheDocument();
    await userEvent.type(await body.findByRole('textbox'), ' ADDRESS CITY ');
    await userEvent.click(await body.findByText(' Address City'));
    expect(args.onVariableSelect).toHaveBeenCalledWith(
      '{{trigger.properties.after.fields.address.addressCity}}',
    );
  },
};
