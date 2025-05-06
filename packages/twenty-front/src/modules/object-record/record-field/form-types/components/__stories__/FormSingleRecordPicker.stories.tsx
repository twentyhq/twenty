import { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { MOCKED_STEP_ID } from '~/testing/mock-data/workflow';
import { FormSingleRecordPicker } from '../FormSingleRecordPicker';

const meta: Meta<typeof FormSingleRecordPicker> = {
  title: 'UI/Data/Field/Form/Input/FormSingleRecordPicker',
  component: FormSingleRecordPicker,
  parameters: {
    msw: graphqlMocks,
  },
  args: {},
  argTypes: {},
  decorators: [
    I18nFrontDecorator,
    ObjectMetadataItemsDecorator,
    ComponentDecorator,
    WorkspaceDecorator,
    SnackBarDecorator,
  ],
};

export default meta;

type Story = StoryObj<typeof FormSingleRecordPicker>;

export const Default: Story = {
  args: {
    label: 'Company',
    defaultValue: '123e4567-e89b-12d3-a456-426614174000',
    objectNameSingular: 'company',
    onChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Company');
    const dropdown = await canvas.findByRole('button');
    expect(dropdown).toBeVisible();
  },
};

export const WithVariables: Story = {
  args: {
    label: 'Company',
    defaultValue: `{{${MOCKED_STEP_ID}.company.id}}`,
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

    await canvas.findByText('Company');
    const variablePicker = await canvas.findByText('VariablePicker');
    expect(variablePicker).toBeVisible();
  },
};

export const Disabled: Story = {
  args: {
    label: 'Company',
    defaultValue: '123e4567-e89b-12d3-a456-426614174000',
    objectNameSingular: 'company',
    onChange: fn(),
    disabled: true,
    VariablePicker: () => <div>VariablePicker</div>,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Company');
    const dropdown = canvas.queryByRole('button');
    expect(dropdown).not.toBeInTheDocument();

    // Variable picker should not be visible when disabled
    const variablePicker = canvas.queryByText('VariablePicker');
    expect(variablePicker).not.toBeInTheDocument();

    // Clicking should not trigger onChange
    await userEvent.click(dropdown);
    expect(args.onChange).not.toHaveBeenCalled();
  },
};
