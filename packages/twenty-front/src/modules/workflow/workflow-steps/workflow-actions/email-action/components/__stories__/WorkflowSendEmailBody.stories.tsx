import { type WorkflowSendEmailAction } from '@/workflow/types/Workflow';
import { WorkflowSendEmailBody } from '@/workflow/workflow-steps/workflow-actions/email-action/components/WorkflowSendEmailBody';
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

const DEFAULT_ACTION: WorkflowSendEmailAction = {
  id: getWorkflowNodeIdMock(),
  name: 'Send Email',
  type: 'SEND_EMAIL',
  valid: false,
  settings: {
    input: {
      connectedAccountId: '',
      email: '',
      subject: '',
      body: '',
    },
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: false },
      continueOnFailure: { value: false },
    },
  },
};

const RICH_CONTENT_ACTION: WorkflowSendEmailAction = {
  id: getWorkflowNodeIdMock(),
  name: 'Welcome Email',
  type: 'SEND_EMAIL',
  valid: true,
  settings: {
    input: {
      connectedAccountId: 'test-account-id',
      email: 'user@example.com',
      subject: 'Welcome to Twenty!',
      body: JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Welcome to Twenty!' }],
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
                marks: [
                  { type: 'link', attrs: { href: 'https://twenty.com' } },
                ],
                text: 'website',
              },
              { type: 'text', text: ' to get started.' },
            ],
          },
        ],
      }),
    },
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: true },
      continueOnFailure: { value: false },
    },
  },
};

const meta: Meta<typeof WorkflowSendEmailBody> = {
  title: 'Modules/Workflow/Actions/SendEmail/EmailBody',
  component: WorkflowSendEmailBody,
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
    action: DEFAULT_ACTION,
    label: 'Email Body',
    placeholder: 'Enter your email content...',
    defaultValue: '',
    onChange: fn(),
    readonly: false,
    VariablePicker: WorkflowVariablePicker,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Email Body')).toBeVisible();
    expect(await canvas.findByRole('textbox')).toBeVisible();
  },
};

export const WithRichContent: Story = {
  args: {
    action: RICH_CONTENT_ACTION,
    label: 'Email Body',
    placeholder: 'Enter your email content...',
    defaultValue: RICH_CONTENT_ACTION.settings.input.body,
    onChange: fn(),
    readonly: false,
    VariablePicker: WorkflowVariablePicker,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Email Body')).toBeVisible();
    expect(await canvas.findByText('Welcome to Twenty!')).toBeVisible();
    expect(await canvas.findByText('excited')).toBeVisible();
    expect(await canvas.findByText('website')).toBeVisible();
  },
};

export const ReadOnly: Story = {
  args: {
    action: RICH_CONTENT_ACTION,
    label: 'Email Body (Read Only)',
    defaultValue: RICH_CONTENT_ACTION.settings.input.body,
    onChange: fn(),
    readonly: true,
    VariablePicker: WorkflowVariablePicker,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Email Body (Read Only)')).toBeVisible();
    expect(await canvas.findByText('Welcome to Twenty!')).toBeVisible();
  },
};

export const WithError: Story = {
  args: {
    action: DEFAULT_ACTION,
    label: 'Email Body',
    error: 'Email body is required',
    placeholder: 'Enter your email content...',
    defaultValue: '',
    onChange: fn(),
    readonly: false,
    VariablePicker: WorkflowVariablePicker,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Email Body')).toBeVisible();
    expect(await canvas.findByText('Email body is required')).toBeVisible();
  },
};

export const WithHint: Story = {
  args: {
    action: DEFAULT_ACTION,
    label: 'Email Body',
    hint: 'You can use variables, format text, and add images to your email content.',
    placeholder: 'Enter your email content...',
    defaultValue: '',
    onChange: fn(),
    readonly: false,
    VariablePicker: WorkflowVariablePicker,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Email Body')).toBeVisible();
    expect(
      await canvas.findByText(
        'You can use variables, format text, and add images to your email content.',
      ),
    ).toBeVisible();
  },
};

export const Interactive: Story = {
  args: {
    action: DEFAULT_ACTION,
    label: 'Email Body',
    placeholder: 'Start typing to see the editor in action...',
    defaultValue: '',
    onChange: fn(),
    readonly: false,
    VariablePicker: WorkflowVariablePicker,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Email Body')).toBeVisible();

    const editor = await canvas.findByRole('textbox');
    expect(editor).toBeVisible();

    await userEvent.click(editor);
    await userEvent.type(editor, 'Hello World!');
  },
};

export const WithoutVariablePicker: Story = {
  args: {
    action: DEFAULT_ACTION,
    label: 'Email Body',
    placeholder: 'Enter your email content...',
    defaultValue: '',
    onChange: fn(),
    readonly: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Email Body')).toBeVisible();
    expect(await canvas.findByRole('textbox')).toBeVisible();
  },
};

export const WithLongContent: Story = {
  args: {
    action: {
      ...DEFAULT_ACTION,
      settings: {
        ...DEFAULT_ACTION.settings,
        input: {
          ...DEFAULT_ACTION.settings.input,
          body: JSON.stringify({
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
      },
    },
    label: 'Email Body',
    placeholder: 'Enter your email content...',
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
    onChange: fn(),
    readonly: false,
    VariablePicker: WorkflowVariablePicker,
  },
};
