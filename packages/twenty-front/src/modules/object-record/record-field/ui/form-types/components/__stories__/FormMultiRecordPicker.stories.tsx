import { FormMultiRecordPicker } from '@/object-record/record-field/ui/form-types/components/FormMultiRecordPicker';
import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';
import {
  ComponentDecorator,
  RouterDecorator,
} from 'twenty-ui-deprecated/testing';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { MOCKED_STEP_ID } from '~/testing/mock-data/workflow';

const meta: Meta<typeof FormMultiRecordPicker> = {
  title: 'UI/Data/Field/Form/Input/FormMultiRecordPicker',
  component: FormMultiRecordPicker,
  parameters: {
    msw: graphqlMocks,
  },
  args: {},
  argTypes: {},
  decorators: [
    ObjectMetadataItemsDecorator,
    ComponentDecorator,
    WorkspaceDecorator,
    SnackBarDecorator,
  ],
};

export default meta;

type Story = StoryObj<typeof FormMultiRecordPicker>;

const StyledNarrowContainer = styled.div`
  width: 480px;
`;

export const Default: Story = {
  args: {
    label: 'Companies',
    defaultValue: ['123e4567-e89b-12d3-a456-426614174000'],
    objectNameSingular: 'company',
    onChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const label = await canvas.findByText('Companies');
    expect(label).toBeVisible();

    const dropdown = await canvas.findByRole('button');
    expect(dropdown).toBeVisible();

    await userEvent.click(dropdown);
  },
};

export const WithManyRecords: Story = {
  args: {
    label: 'Companies',
    defaultValue: [
      '20202020-1553-45c6-a028-5a9064cce07f',
      '20202020-a000-4485-94de-70c2a98daef2',
      '20202020-0001-4001-8001-000000000001',
      '20202020-0002-4002-8002-000000000002',
      '20202020-0003-4003-8003-000000000003',
      '20202020-0004-4004-8004-000000000004',
    ],
    objectNameSingular: 'company',
    onChange: fn(),
    VariablePicker: () => <div>VariablePicker</div>,
  },
  decorators: [
    (Story) => (
      <StyledNarrowContainer>
        <Story />
      </StyledNarrowContainer>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Companies');

    const hiddenChipCount = await canvas.findByText(/^\+\d+$/);
    expect(hiddenChipCount).toBeVisible();

    const variablePicker = await canvas.findByText('VariablePicker');
    expect(variablePicker).toBeVisible();
  },
};

export const WithVariable: Story = {
  args: {
    label: 'Companies',
    defaultValue: `{{${MOCKED_STEP_ID}.companies}}`,
    objectNameSingular: 'company',
    onChange: fn(),
    VariablePicker: () => <div>VariablePicker</div>,
  },
  decorators: [
    WorkflowStepDecorator,
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
    RouterDecorator,
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Companies');
    const variablePicker = await canvas.findByText('VariablePicker');
    expect(variablePicker).toBeVisible();
  },
};

export const Readonly: Story = {
  args: {
    label: 'Companies',
    defaultValue: ['123e4567-e89b-12d3-a456-426614174000'],
    objectNameSingular: 'company',
    onChange: fn(),
    readonly: true,
    VariablePicker: () => <div>VariablePicker</div>,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Companies');
    const dropdown = canvas.queryByRole('button');
    expect(dropdown).not.toBeInTheDocument();

    const variablePicker = canvas.queryByText('VariablePicker');
    expect(variablePicker).not.toBeInTheDocument();

    if (isDefined(dropdown)) {
      await userEvent.click(dropdown);
    }
    expect(args.onChange).not.toHaveBeenCalled();
  },
};
