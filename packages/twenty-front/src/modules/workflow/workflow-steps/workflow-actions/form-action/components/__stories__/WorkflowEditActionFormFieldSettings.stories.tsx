import { WorkflowFormAction } from '@/workflow/types/Workflow';
import { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { FieldMetadataType } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { WorkflowEditActionFormFieldSettings } from '../WorkflowEditActionFormFieldSettings';

const meta: Meta<typeof WorkflowEditActionFormFieldSettings> = {
  title: 'Modules/Workflow/Actions/Form/WorkflowEditActionFormFieldSettings',
  component: WorkflowEditActionFormFieldSettings,
  decorators: [
    WorkflowStepActionDrawerDecorator,
    ComponentDecorator,
    I18nFrontDecorator,
    ObjectMetadataItemsDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof WorkflowEditActionFormFieldSettings>;

const mockAction: WorkflowFormAction = {
  id: 'form-action-1',
  type: 'FORM',
  name: 'Test Form',
  valid: true,
  settings: {
    input: [
      {
        id: 'field-1',
        name: 'text',
        label: 'Text Field',
        type: FieldMetadataType.TEXT,
        placeholder: 'Enter text',
        settings: {},
      },
    ],
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: false },
      continueOnFailure: { value: false },
    },
  },
};

export const TextFieldSettings: Story = {
  args: {
    field: mockAction.settings.input[0],
    onClose: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const typeSelect = await canvas.findByText('Text');
    expect(typeSelect).toBeVisible();

    const placeholderInput = await canvas.findByText('Enter text');
    expect(placeholderInput).toBeVisible();

    const closeButton = await canvas.findByTestId('close-button');
    await userEvent.click(closeButton);
    expect(args.onClose).toHaveBeenCalled();
  },
};

export const NumberFieldSettings: Story = {
  args: {
    field: {
      id: 'field-2',
      name: 'number',
      label: 'Number Field',
      type: FieldMetadataType.NUMBER,
      placeholder: 'Enter number',
      settings: {},
    },
    onClose: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const typeSelect = await canvas.findByText('Number');
    expect(typeSelect).toBeVisible();

    const placeholderInput = await canvas.findByText('Enter number');
    expect(placeholderInput).toBeInTheDocument();

    const closeButton = await canvas.findByTestId('close-button');
    await userEvent.click(closeButton);
    expect(args.onClose).toHaveBeenCalled();
  },
};

export const SingleRecordFieldSettings: Story = {
  args: {
    field: {
      id: 'field-3',
      name: 'company',
      label: 'Company',
      type: 'RECORD',
      settings: {
        objectName: 'company',
      },
    },
    onClose: fn(),
  },

  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const typeSelect = await canvas.findByText('Record');
    expect(typeSelect).toBeVisible();

    const objectSelect = await canvas.findByText('Companies');
    expect(objectSelect).toBeVisible();

    const closeButton = await canvas.findByTestId('close-button');
    await userEvent.click(closeButton);
    expect(args.onClose).toHaveBeenCalled();
  },
};

export const DateFieldSettings: Story = {
  args: {
    field: {
      id: 'field-4',
      name: 'date',
      label: 'Date Field',
      type: FieldMetadataType.DATE,
      placeholder: 'Enter date',
      settings: {},
    },
    onClose: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const typeSelect = await canvas.findByText('Date');
    expect(typeSelect).toBeVisible();

    const closeButton = await canvas.findByTestId('close-button');
    await userEvent.click(closeButton);
    expect(args.onClose).toHaveBeenCalled();
  },
};
