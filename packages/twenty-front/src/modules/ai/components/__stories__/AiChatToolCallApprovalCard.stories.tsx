import { type Meta, type StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { getWorker } from 'msw-storybook-addon';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  PUBLISH_FRONT_COMPONENT_TOOL_NAME,
  PROPOSE_TOOL_CALL_TOOL_NAME,
  type ProposedToolCall,
  type ExtendedUIMessagePart,
} from 'twenty-shared/ai';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatPendingAskGate } from '@/ai/components/AiChatPendingAskGate';
import { AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME } from '@/ai/constants/AgentChatRefetchMessagesEventName';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatMessagesFamilyState } from '@/ai/states/agentChatMessagesFamilyState';
import { REST_API_BASE_URL } from '@/apollo/constants/RestApiBaseUrl';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { AiChatToolCallApprovalCard } from '@/ai/components/AiChatToolCallApprovalCard';
import {
  frontComponentPreviewHandlers,
  getFrontComponentPreviewMock,
  seedFrontComponentPreviewWorkspace,
} from '@/ai/components/__mocks__/aiChatFrontComponentPreviewMocks';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const PROPOSAL: ProposedToolCall = {
  toolName: PUBLISH_FRONT_COMPONENT_TOOL_NAME,
  toolLabel: 'Publish Front Component',
  summary: 'Save this counter to the Workspace app',
  arguments: { draftId: 'current', checksum: 'a'.repeat(64) },
  template: 'frontComponent',
};

const meta: Meta<typeof AiChatToolCallApprovalCard> = {
  title: 'Modules/AI/AiChatToolCallApprovalCard',
  component: AiChatToolCallApprovalCard,
  decorators: [
    RootDecorator,
    ToastDecorator,
    MemoryRouterDecorator,
    ComponentDecorator,
  ],
  beforeEach: () => seedFrontComponentPreviewWorkspace(),
  parameters: {
    container: { width: 600 },
    msw: { handlers: frontComponentPreviewHandlers },
  },
  args: {
    toolCallId: 'publish-call',
    proposal: PROPOSAL,
  },
};

export default meta;
type Story = StoryObj<typeof AiChatToolCallApprovalCard>;

export const ComponentPreview: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Sample data')).toBeVisible();
    await userEvent.click(
      await canvas.findByRole(
        'button',
        { name: 'Count: 0' },
        { timeout: 30000 },
      ),
    );
    await expect(
      await canvas.findByRole('button', { name: 'Count: 1' }),
    ).toBeVisible();
    await expect(
      canvas.queryByRole('textbox', { name: 'Arguments' }),
    ).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Approve' })).toBeEnabled();
    await expect(canvas.getByRole('button', { name: 'Reject' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Add feedback' }));
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Feedback' }),
      'Make it smaller',
    );
    await expect(
      canvas.getByRole('button', { name: 'Count: 1' }),
    ).toBeVisible();
  },
};

export const SupersededPreview: Story = {
  args: {
    proposal: {
      ...PROPOSAL,
      arguments: { ...PROPOSAL.arguments, draftId: 'superseded' },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText(
        'A newer revision exists. Open the latest preview to save.',
      ),
    ).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Approve' }),
    ).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Reject' })).toBeEnabled();
  },
};

export const UnavailablePreview: Story = {
  args: {
    proposal: {
      ...PROPOSAL,
      arguments: { ...PROPOSAL.arguments, draftId: 'unavailable' },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole('alert')).toHaveTextContent(
      'Could not load preview.',
    );
    await expect(
      canvas.getByRole('button', { name: 'Approve' }),
    ).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Reject' })).toBeEnabled();
  },
};

export const DisabledFeature: Story = {
  beforeEach: () => seedFrontComponentPreviewWorkspace(false),
  play: UnavailablePreview.play,
};

export const SupersededAfterRefresh: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByRole('button', { name: 'Count: 0' }, { timeout: 30000 });
    await expect(canvas.getByRole('button', { name: 'Approve' })).toBeEnabled();
    getWorker().use(
      http.get(`${REST_API_BASE_URL}/ai-front-components/drafts/:draftId`, () =>
        HttpResponse.json(getFrontComponentPreviewMock('superseded')),
      ),
    );
    dispatchBrowserEvent(AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME);
    await expect(
      await canvas.findByText(
        'A newer revision exists. Open the latest preview to save.',
      ),
    ).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Approve' }),
    ).toBeDisabled();
  },
};

const requestedDraftIds: string[] = [];

export const PendingRequests: Story = {
  render: () => (
    <AiChatPendingAskGate>
      <span>No pending requests</span>
    </AiChatPendingAskGate>
  ),
  beforeEach: () => {
    requestedDraftIds.length = 0;
    getWorker().use(
      http.get(
        `${REST_API_BASE_URL}/ai-front-components/drafts/:draftId`,
        ({ params }) => {
          requestedDraftIds.push(String(params.draftId));
          return HttpResponse.json(
            getFrontComponentPreviewMock(String(params.draftId)),
          );
        },
      ),
    );
    const previousThread = jotaiStore.get(agentChatDisplayedThreadState.atom);
    const messagesAtom = agentChatMessagesFamilyState.atomFamily({
      threadId: 'approval-preview-story',
    });
    const previousMessages = jotaiStore.get(messagesAtom);
    jotaiStore.set(
      agentChatDisplayedThreadState.atom,
      'approval-preview-story',
    );
    jotaiStore.set(messagesAtom, [
      {
        id: 'pending-publications',
        role: 'assistant',
        parts: ['current', 'record-page'].map(
          (draftId): ExtendedUIMessagePart => ({
            type: `tool-${PROPOSE_TOOL_CALL_TOOL_NAME}`,
            toolCallId: draftId,
            state: 'output-available',
            input: {},
            output: {
              success: true,
              result: {
                status: 'pending',
                proposal: {
                  ...PROPOSAL,
                  arguments: { ...PROPOSAL.arguments, draftId },
                },
              },
            },
          }),
        ),
      },
    ]);
    return () => {
      jotaiStore.set(agentChatDisplayedThreadState.atom, previousThread);
      jotaiStore.set(messagesAtom, previousMessages);
    };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByRole('button', { name: 'Count: 0' }, { timeout: 30000 });
    await expect(requestedDraftIds).toEqual(['current']);
    await userEvent.click(canvas.getByRole('button', { name: 'Add feedback' }));
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Feedback' }),
      'Keep this feedback',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Next request' }));
    await canvas.findByText('Record page widget');
    await expect(requestedDraftIds).toEqual(['current', 'record-page']);
    await expect(canvas.getAllByText('Sample data')).toHaveLength(1);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Previous request' }),
    );
    await waitFor(() =>
      expect(requestedDraftIds).toEqual(['current', 'record-page', 'current']),
    );
    await expect(canvas.getByRole('textbox', { name: 'Feedback' })).toHaveValue(
      'Keep this feedback',
    );
    await canvas.findByRole('button', { name: 'Count: 0' }, { timeout: 30000 });
  },
};
