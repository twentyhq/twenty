import { FormAdvancedTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormAdvancedTextFieldInput';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { type Meta, type StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { graphql, HttpResponse } from 'msw';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { WorkflowStepActionDrawerDecorator } from '~/testing/decorators/WorkflowStepActionDrawerDecorator';
import { WorkflowStepDecorator } from '~/testing/decorators/WorkflowStepDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getWorkflowNodeIdMock } from '~/testing/mock-data/workflow';

const DEFAULT_PROPS = {
  label: 'Advanced Text Field',
  placeholder: 'Enter your content...',
  defaultValue: '',
  onChange: fn(),
  readonly: false,
  maxHeight: 200,
  maxWidth: 800,
};

const RICH_CONTENT_VALUE = JSON.stringify({
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Welcome!' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Dear ' },
        {
          type: 'variableTag',
          attrs: { variable: '{{firstName}}' },
        },
        { type: 'text', text: ',' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Thank you for joining us! We are ' },
        {
          type: 'text',
          marks: [{ type: 'bold' }],
          text: 'excited',
        },
        { type: 'text', text: ' to have you on board.' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Visit our ' },
        {
          type: 'text',
          marks: [{ type: 'link', attrs: { href: 'https://twenty.com' } }],
          text: 'website',
        },
        { type: 'text', text: ' to get started.' },
      ],
    },
  ],
});

const meta: Meta<typeof FormAdvancedTextFieldInput> = {
  title:
    'Modules/ObjectRecord/RecordField/FormTypes/FormAdvancedTextFieldInput',
  component: FormAdvancedTextFieldInput,
  parameters: {
    msw: {
      handlers: [
        ...graphqlMocks.handlers,
        graphql.query('FindManyWorkflows', () => {
          return HttpResponse.json({
            data: {
              workflows: [
                {
                  id: getWorkflowNodeIdMock(),
                  name: 'Test Workflow',
                  __typename: 'Workflow',
                },
              ],
            },
          });
        }),
      ],
    },
  },
  decorators: [
    WorkflowStepActionDrawerDecorator,
    WorkflowStepDecorator,
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
    RouterDecorator,
    WorkspaceDecorator,
    I18nFrontDecorator,
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ...DEFAULT_PROPS,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Advanced Text Field')).toBeVisible();
    expect(await canvas.findByRole('textbox')).toBeVisible();
  },
};

export const WithRichContent: Story = {
  args: {
    ...DEFAULT_PROPS,
    label: 'Rich Text Content',
    defaultValue: RICH_CONTENT_VALUE,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Rich Text Content')).toBeVisible();
    expect(await canvas.findByText('Welcome!')).toBeVisible();
    expect(await canvas.findByText('excited')).toBeVisible();
    expect(await canvas.findByText('website')).toBeVisible();
  },
};

export const ReadOnly: Story = {
  args: {
    ...DEFAULT_PROPS,
    label: 'Read Only Field',
    defaultValue: RICH_CONTENT_VALUE,
    readonly: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Read Only Field')).toBeVisible();
    expect(await canvas.findByText('Welcome!')).toBeVisible();
  },
};

export const WithError: Story = {
  args: {
    ...DEFAULT_PROPS,
    label: 'Field with Error',
    error: 'This field is required',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Field with Error')).toBeVisible();
    expect(await canvas.findByText('This field is required')).toBeVisible();
  },
};

export const WithHint: Story = {
  args: {
    ...DEFAULT_PROPS,
    label: 'Field with Hint',
    hint: 'You can use variables, format text, and add images to your content.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Field with Hint')).toBeVisible();
    expect(
      await canvas.findByText(
        'You can use variables, format text, and add images to your content.',
      ),
    ).toBeVisible();
  },
};

export const Interactive: Story = {
  args: {
    ...DEFAULT_PROPS,
    label: 'Interactive Field',
    placeholder: 'Start typing to see the editor in action...',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Interactive Field')).toBeVisible();

    const editor = await canvas.findByRole('textbox');
    expect(editor).toBeVisible();

    await userEvent.click(editor);
    await userEvent.type(editor, 'Hello World!');
  },
};

export const WithVariablePicker: Story = {
  args: {
    ...DEFAULT_PROPS,
    label: 'Field with Variable Picker',
    VariablePicker: WorkflowVariablePicker,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Field with Variable Picker')).toBeVisible();
    expect(await canvas.findByRole('textbox')).toBeVisible();
  },
};

export const WithoutVariablePicker: Story = {
  args: {
    ...DEFAULT_PROPS,
    label: 'Field without Variable Picker',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText('Field without Variable Picker'),
    ).toBeVisible();
    expect(await canvas.findByRole('textbox')).toBeVisible();
  },
};

export const WithLongContent: Story = {
  args: {
    ...DEFAULT_PROPS,
    label: 'Field with Long Content',
    defaultValue: JSON.stringify({
      type: 'doc',
      content: Array.from({ length: 20 }, (_, i) => ({
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: `This is paragraph ${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.`,
          },
        ],
      })),
    }),
  },
};

export const CustomSize: Story = {
  args: {
    ...DEFAULT_PROPS,
    label: 'Custom Size Field',
    maxHeight: 300,
    maxWidth: 600,
    placeholder: 'This field has custom dimensions...',
  },
};

export const DisabledFullScreen: Story = {
  args: {
    ...DEFAULT_PROPS,
    label: 'Field without Full Screen',
    enableFullScreen: false,
  },
};
