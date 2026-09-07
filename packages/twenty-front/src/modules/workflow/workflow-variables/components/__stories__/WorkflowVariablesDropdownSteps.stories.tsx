import { WorkflowVariablesDropdownSteps } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdownSteps';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const STEPS: StepOutputSchemaV2[] = [
  {
    id: 'trigger',
    name: 'Manual trigger',
    type: 'MANUAL',
    outputSchema: {
      companyName: {
        isLeaf: true,
        label: 'Company name',
        type: 'string',
        value: '',
      },
    },
  },
  {
    id: 'code',
    name: 'Run code',
    type: 'CODE',
    outputSchema: {
      result: {
        isLeaf: false,
        type: 'object',
        label: 'Result',
        value: {
          companyName: {
            isLeaf: true,
            label: 'Company name',
            type: 'string',
            value: '',
          },
        },
      },
    },
  },
];

const ASYNC_DECORATOR_WAIT_OPTIONS = { timeout: 5_000 };

const meta = {
  title: 'Modules/Workflow/Variables/WorkflowVariablesDropdownSteps',
  component: WorkflowVariablesDropdownSteps,
  parameters: {
    msw: graphqlMocks,
  },
  args: {
    dropdownId: 'variables',
    steps: STEPS,
    onSelect: fn(),
    onVariableSelect: fn(),
  },
  decorators: [
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    WorkspaceDecorator,
  ],
} satisfies Meta<typeof WorkflowVariablesDropdownSteps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const runCodeItem = await canvas.findByText(
      'Run code',
      undefined,
      ASYNC_DECORATOR_WAIT_OPTIONS,
    );

    expect(canvas.queryByText('Company name')).not.toBeInTheDocument();
    await userEvent.click(runCodeItem);
    expect(args.onSelect).toHaveBeenCalledWith({ stepId: 'code' });
  },
};

export const NestedFieldSearch: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const searchInput = await canvas.findByPlaceholderText(
      'Search steps and fields',
      undefined,
      ASYNC_DECORATOR_WAIT_OPTIONS,
    );

    await userEvent.type(searchInput, ' COMPANY NAME ');
    expect(canvas.getAllByText('Company name')).toHaveLength(2);
    expect(
      canvas.getByText('Run code / Result', { exact: false }),
    ).toBeInTheDocument();
    await userEvent.click(canvas.getAllByText('Company name')[1]);
    expect(args.onVariableSelect).toHaveBeenCalledWith({
      rawVariableName: '{{code.result.companyName}}',
      stepId: 'code',
      isFullRecord: false,
    });
    expect(args.onSelect).not.toHaveBeenCalled();
  },
};

export const NestedContainerSearch: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const searchInput = await canvas.findByPlaceholderText(
      'Search steps and fields',
      undefined,
      ASYNC_DECORATOR_WAIT_OPTIONS,
    );

    await userEvent.type(searchInput, 'result');
    await userEvent.click(canvas.getByText('Result'));
    expect(args.onSelect).toHaveBeenCalledWith({
      stepId: 'code',
      path: ['result'],
    });
    expect(args.onVariableSelect).not.toHaveBeenCalled();
  },
};

export const WholeRecordSearch: Story = {
  args: {
    shouldDisplayRecordObjects: true,
    steps: [
      {
        id: 'trigger',
        name: 'Record created',
        type: 'DATABASE_EVENT',
        outputSchema: {
          _outputSchemaType: 'RECORD',
          object: { label: 'Company', objectMetadataId: 'company' },
          fields: {},
        },
      },
    ],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const searchInput = await canvas.findByPlaceholderText(
      'Search steps and fields',
      undefined,
      ASYNC_DECORATOR_WAIT_OPTIONS,
    );

    await userEvent.type(searchInput, 'company');
    await userEvent.click(canvas.getByText('Company'));
    expect(args.onVariableSelect).toHaveBeenCalledWith({
      rawVariableName: '{{trigger.id}}',
      stepId: 'trigger',
      isFullRecord: true,
    });
  },
};

export const StepSearchAndEmptyState: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const searchInput = await canvas.findByPlaceholderText(
      'Search steps and fields',
      undefined,
      ASYNC_DECORATOR_WAIT_OPTIONS,
    );

    await userEvent.type(searchInput, 'RUN CODE');
    expect(canvas.getByText('Run code')).toBeInTheDocument();
    expect(canvas.queryByText('Manual trigger')).not.toBeInTheDocument();
    await userEvent.clear(searchInput);
    expect(canvas.getByText('Manual trigger')).toBeInTheDocument();
    await userEvent.type(searchInput, 'unavailable');
    expect(canvas.getByText('No variables available')).toBeInTheDocument();
  },
};
