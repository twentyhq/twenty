import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { ComponentDecorator } from 'twenty-ui/testing';

import { ThinkingStepsDisplay } from '@/ai-chat/thinking-steps/components/ThinkingStepsDisplay';
import { AiChatInstanceDecorator } from '~/testing/decorators/AiChatInstanceDecorator';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<typeof ThinkingStepsDisplay> = {
  title: 'Modules/AI/ThinkingStepsDisplay',
  component: ThinkingStepsDisplay,
  decorators: [
    AiChatInstanceDecorator,
    ToastDecorator,
    MemoryRouterDecorator,
    ComponentDecorator,
  ],
  parameters: {
    container: { width: 500 },
    msw: {
      handlers: [
        graphql.query('GetToolIndex', () =>
          HttpResponse.json({ data: { getToolIndex: [] } }),
        ),
      ],
    },
  },
  args: {
    messageId: 'thinking-steps-story-message',
    renderItemIndex: 0,
    isLastMessageStreaming: false,
    parts: [
      { type: 'reasoning', state: 'done', text: 'Reviewed the request.' },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof ThinkingStepsDisplay>;

export const SummaryDisclosure: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: '1 step' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(canvas.queryByText('Thought')).toBeNull();
    await userEvent.tab();
    expect(toggle).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const panelId = toggle.getAttribute('aria-controls');
    assertIsDefinedOrThrow(panelId);
    await waitFor(() => {
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      expect(canvasElement.ownerDocument.getElementById(panelId)).toBeVisible();
      expect(canvas.getByText('Thought')).toBeVisible();
    });
    await userEvent.keyboard(' ');
    await waitFor(() => {
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(canvas.queryByText('Thought')).toBeNull();
    });
  },
};

export const WhileWorking: Story = {
  args: {
    isLastMessageStreaming: true,
    isTrailingWhileStreaming: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('button', { name: 'Thinking' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(canvas.queryByText('Thought')).toBeNull();
  },
};

export const ToolDetails: Story = {
  args: {
    parts: [
      {
        type: 'dynamic-tool',
        toolName: 'inspect_tool',
        toolCallId: 'inspect-tool-call',
        state: 'output-available',
        input: 'Saved input',
        output: 'Saved output',
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '1 step' }));
    expect(
      await canvas.findByRole('button', { name: 'Show details' }),
    ).toBeInTheDocument();
    expect(canvas.queryByRole('button', { name: /inspect_tool/ })).toBeNull();
    expect(canvas.queryByText('Saved output')).toBeNull();
  },
};

export const FailedTool: Story = {
  args: {
    parts: [
      {
        type: 'dynamic-tool',
        toolName: 'inspect_tool',
        toolCallId: 'failed-tool-call',
        state: 'output-error',
        input: 'Saved input',
        errorText: 'Timed out after 10s',
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '1 step' }));
    await waitFor(() => {
      expect(canvas.getByText('Timed out after 10s')).toBeVisible();
      expect(
        canvas.getByRole('button', { name: 'Show details' }),
      ).toBeInTheDocument();
    });
  },
};

const RECORD_TOOL_DECORATORS = [
  IconsProviderDecorator,
  WorkspaceDecorator,
  ObjectMetadataItemsDecorator,
];

const COMPANY_RECORD_REFERENCES = [
  {
    objectNameSingular: 'company',
    recordId: '20202020-a225-4b3d-a89c-7f6c30df998a',
    displayName: 'Microsoft',
  },
  {
    objectNameSingular: 'company',
    recordId: '20202020-a8b0-422c-8fcf-5b7496f94975',
    displayName: 'Meta',
  },
  {
    objectNameSingular: 'company',
    recordId: '20202020-aaf7-41d6-87a9-7add07bebfd8',
    displayName: 'SLB',
  },
];

export const ToolWithOneRecord: Story = {
  decorators: RECORD_TOOL_DECORATORS,
  parameters: { msw: graphqlMocks },
  args: {
    parts: [
      {
        type: 'dynamic-tool',
        toolName: 'create_company',
        toolCallId: 'create-company-call',
        state: 'output-available',
        input: { name: 'Microsoft' },
        output: {
          message: 'Record created successfully in company',
          recordReferences: COMPANY_RECORD_REFERENCES.slice(0, 1),
        },
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole('button', { name: '1 step' }),
    );
    await waitFor(() => {
      expect(canvas.getByText('Microsoft')).toBeVisible();
    });
  },
};

export const ToolWithSeveralRecords: Story = {
  decorators: RECORD_TOOL_DECORATORS,
  parameters: { msw: graphqlMocks },
  args: {
    parts: [
      {
        type: 'dynamic-tool',
        toolName: 'find_companies',
        toolCallId: 'find-companies-call',
        state: 'output-available',
        input: {},
        output: {
          message: 'Found 3 company records',
          recordReferences: COMPANY_RECORD_REFERENCES,
        },
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole('button', { name: '1 step' }),
    );
    await waitFor(() => {
      expect(canvas.getByText('3 records')).toBeVisible();
    });
    expect(canvas.queryByText('Microsoft')).toBeNull();
  },
};
