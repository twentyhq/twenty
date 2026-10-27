import { getMockedDateWithOffset } from '~/testing/utils/getMockedDateWithOffset';
import { MOCKED_DATE } from '~/testing/constants/MockedDate';
import {
  type Decorator,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { Suspense, useEffect } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatMessage } from '@/ai/components/AiChatMessage';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { agentChatThreadVisitState } from '@/ai/states/agentChatThreadVisitState';
import { agentChatMessageReactionsFamilyState } from '@/ai/states/agentChatMessageReactionsFamilyState';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import {
  mockCurrentWorkspace,
  mockedWorkspaceMemberData,
} from '~/testing/mock-data/users';
import { MarkdownLoadingSkeleton } from '@/ai/components/LazyMarkdownRenderer';

import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatMessagesFamilyState } from '@/ai/states/agentChatMessagesFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';

import { styled } from '@linaria/react';
import { useStore } from 'jotai';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { IMAGE_URL_MOCK } from '~/testing/mock-data/image-url';

const StyledConversationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 700px;
  padding: 24px;
`;

const mockUserMessage: ExtendedUIMessage = {
  id: 'msg-user-1',
  role: 'user',
  parts: [
    {
      type: 'text',
      text: 'Can you analyze my sales data and create a chart showing the monthly trends?',
    },
  ],
  metadata: {
    createdAt: getMockedDateWithOffset({ minutes: -2 }),
    senderWorkspaceMemberId: mockedWorkspaceMemberData.id,
  },
};

const mockAssistantWithCodeExecution: ExtendedUIMessage = {
  id: 'msg-assistant-1',
  role: 'assistant',
  parts: [
    {
      type: 'data-code-execution',
      data: {
        executionId: 'exec-1',
        state: 'completed',
        code: `import pandas as pd
import matplotlib.pyplot as plt

# Load and process sales data
data = {
    'month': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    'sales': [12500, 15200, 14800, 18900, 21000, 19500]
}
df = pd.DataFrame(data)

# Create the chart
plt.figure(figsize=(10, 6))
plt.bar(df['month'], df['sales'], color='steelblue')
plt.title('Monthly Sales Trends')
plt.xlabel('Month')
plt.ylabel('Sales ($)')
plt.savefig('sales_chart.png', dpi=150)
print(f"Total sales: $" + str(df['sales'].sum()))
print("Chart saved successfully!")`,
        language: 'python',
        stdout: 'Total sales: $101,900\nChart saved successfully!',
        stderr: '',
        exitCode: 0,
        executionTimeMs: 2340,
        files: [
          {
            fileId: '550e8400-e29b-41d4-a716-446655440005',
            filename: 'sales_chart.png',
            url: IMAGE_URL_MOCK,
            mimeType: 'image/png',
          },
        ],
      },
    },
    {
      type: 'text',
      text: "I've analyzed your sales data and created a chart showing the monthly trends. Here are the key insights:\n\n- **Total sales**: $101,900 over 6 months\n- **Peak month**: May with $21,000 in sales\n- **Growth trend**: Overall positive trajectory with 68% growth from January to May\n\nThe chart shows a clear upward trend with a slight dip in March. Would you like me to perform any additional analysis?",
    },
  ],
  metadata: {
    createdAt: getMockedDateWithOffset({ minutes: -1 }),
    usage: {
      inputTokens: 1250,
      outputTokens: 890,
      cachedInputTokens: 0,
      inputCredits: 12,
      outputCredits: 8,
      conversationSize: 1250,
    },
  },
};

const mockSimpleTextResponse: ExtendedUIMessage = {
  id: 'msg-assistant-text',
  role: 'assistant',
  parts: [
    {
      type: 'text',
      text: "Hello! I'm your AI assistant. I can help you with:\n\n- **Data analysis** - Analyze your CRM data and generate insights\n- **Code execution** - Run Python code for complex calculations\n- **Record management** - Create, update, or find records\n\nHow can I assist you today?",
    },
  ],
  metadata: {
    createdAt: MOCKED_DATE,
  },
};

const mockStreamingMessage: ExtendedUIMessage = {
  id: 'msg-streaming',
  role: 'assistant',
  parts: [
    {
      type: 'text',
      text: 'Let me look into that for you',
    },
  ],
  metadata: {
    createdAt: MOCKED_DATE,
  },
};

const mockCodeExecutionRunning: ExtendedUIMessage = {
  id: 'msg-code-running',
  role: 'assistant',
  parts: [
    {
      type: 'data-code-execution',
      data: {
        executionId: 'exec-running',
        state: 'running',
        code: `import time
print("Processing data...")
time.sleep(5)
print("Done!")`,
        language: 'python',
        stdout: 'Processing data...',
        stderr: '',
        files: [],
      },
    },
  ],
  metadata: {
    createdAt: MOCKED_DATE,
  },
};

const mockCodeExecutionError: ExtendedUIMessage = {
  id: 'msg-code-error',
  role: 'assistant',
  parts: [
    {
      type: 'data-code-execution',
      data: {
        executionId: 'exec-error',
        state: 'error',
        code: `import pandas as pd
df = pd.read_csv('missing_file.csv')
print(df.head())`,
        language: 'python',
        stdout: '',
        stderr:
          "FileNotFoundError: [Errno 2] No such file or directory: 'missing_file.csv'",
        exitCode: 1,
        files: [],
        error: 'File not found',
      },
    },
    {
      type: 'text',
      text: "I encountered an error while trying to read the file. It looks like the file `missing_file.csv` doesn't exist. Could you please check the file path or upload the file you'd like me to analyze?",
    },
  ],
  metadata: {
    createdAt: MOCKED_DATE,
  },
};

const mockThinkingStepsStreaming: ExtendedUIMessage = {
  id: 'msg-thinking-streaming',
  role: 'assistant',
  parts: [
    {
      type: 'tool-web_search',
      toolCallId: 'tool-web-search-streaming',
      input: { query: 'top leads status' },
      output: { result: { ok: true } },
      state: 'output-available',
    },
    {
      type: 'reasoning',
      text: 'I need to evaluate the latest lead activity and pipeline stage changes before I can answer accurately.',
      state: 'streaming',
    },
  ],
  metadata: {
    createdAt: MOCKED_DATE,
  },
};

const mockThinkingStepsDone: ExtendedUIMessage = {
  id: 'msg-thinking-done',
  role: 'assistant',
  parts: [
    {
      type: 'tool-web_search',
      toolCallId: 'tool-web-search-done',
      input: { query: 'top leads status' },
      output: { result: { ok: true } },
      state: 'output-available',
    },
    {
      type: 'reasoning',
      text: 'I filtered the most engaged leads and checked the latest interactions to determine which opportunities are moving forward.',
      state: 'done',
    },
    {
      type: 'text',
      text: 'You currently have 5 top leads in active stages. Two are in proposal review and three are in scheduled demo follow-up.',
    },
  ],
  metadata: {
    createdAt: MOCKED_DATE,
    startedAt: '2026-01-01T10:00:00.000Z',
    finishedAt: '2026-01-01T10:01:23.000Z',
  },
};

const mockAnsweredForm: ExtendedUIMessage = {
  id: 'msg-answered-form',
  role: 'assistant',
  parts: [
    {
      type: 'tool-request_form',
      toolCallId: 'tool-request-form',
      input: {
        fields: [
          { name: 'callDate', label: 'Call date', type: 'DATE' },
          { name: 'summary', label: 'Summary', type: 'TEXT' },
        ],
      },
      output: {
        success: true,
        result: {
          status: 'answered',
          values: {
            callDate: '2026-09-29',
            summary: 'Pipeline import first, SSO the week after.',
          },
        },
      },
      state: 'output-available',
    },
  ],
  metadata: {
    createdAt: MOCKED_DATE,
  },
};

const mockTeammate = {
  ...mockedWorkspaceMemberData,
  id: 'teammate-marco',
  name: { firstName: 'Marco', lastName: 'Rossi' },
  avatarUrl: null,
};

const mockTeammateMessage: ExtendedUIMessage = {
  id: 'msg-teammate',
  role: 'user',
  parts: [{ type: 'text', text: 'I will handle the security review.' }],
  metadata: {
    createdAt: getMockedDateWithOffset({ minutes: -1 }),
    senderWorkspaceMemberId: mockTeammate.id,
  },
};

const mockFormerMemberMessage: ExtendedUIMessage = {
  ...mockTeammateMessage,
  id: 'msg-former-member',
  parts: [{ type: 'text', text: 'The proposal is ready for review.' }],
  metadata: {
    createdAt: MOCKED_DATE,
    senderWorkspaceMemberId: 'former-member',
  },
};

const mockUnknownSenderMessage: ExtendedUIMessage = {
  ...mockTeammateMessage,
  id: 'msg-unknown-sender',
  parts: [{ type: 'text', text: 'A message without sender metadata.' }],
  metadata: { createdAt: MOCKED_DATE },
};

const mockNamedAssistantMessage: ExtendedUIMessage = {
  ...mockTeammateMessage,
  id: 'msg-named-assistant',
  role: 'assistant',
  parts: [{ type: 'text', text: 'The recorded sender remains visible.' }],
};

const allMockMessages = [
  mockUserMessage,
  mockAssistantWithCodeExecution,
  mockSimpleTextResponse,
  mockStreamingMessage,
  mockCodeExecutionRunning,
  mockCodeExecutionError,
  mockThinkingStepsStreaming,
  mockThinkingStepsDone,
  mockAnsweredForm,
  mockTeammateMessage,
  mockFormerMemberMessage,
  mockUnknownSenderMessage,
  mockNamedAssistantMessage,
];

const AgentChatMessagesSetterEffect = ({
  messages,
  isInboxEnabled,
}: {
  messages: ExtendedUIMessage[];
  isInboxEnabled: boolean;
}) => {
  const store = useStore();

  useEffect(() => {
    const currentThreadId = 'conversation-presentation-story';
    const previousCurrentThread = store.get(currentAiChatThreadState.atom);
    const previousDisplayedThread = store.get(
      agentChatDisplayedThreadState.atom,
    );
    const previousWorkspace = store.get(currentWorkspaceState.atom);
    const previousMember = store.get(currentWorkspaceMemberState.atom);
    const previousMembers = store.get(currentWorkspaceMembersState.atom);
    const previousVisit = store.get(agentChatThreadVisitState.atom);
    const messagesAtom = agentChatMessagesFamilyState.atomFamily({
      threadId: currentThreadId,
    });
    const reactionsAtom = agentChatMessageReactionsFamilyState.atomFamily({
      messageId: mockTeammateMessage.id,
    });

    store.set(currentAiChatThreadState.atom, currentThreadId);
    store.set(agentChatDisplayedThreadState.atom, currentThreadId);
    store.set(currentWorkspaceMemberState.atom, mockedWorkspaceMemberData);
    store.set(currentWorkspaceMembersState.atom, [
      mockedWorkspaceMemberData,
      mockTeammate,
    ]);
    store.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      featureFlags: [
        { key: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED, value: isInboxEnabled },
      ],
    });
    store.set(agentChatThreadVisitState.atom, {
      threadId: currentThreadId,
      isUnread: true,
      isKeptUnread: false,
      lastReadAt: getMockedDateWithOffset({ seconds: -90 }),
    });
    store.set(messagesAtom, messages);
    store.set(reactionsAtom, [
      {
        emoji: '👍',
        workspaceMemberIds: [mockedWorkspaceMemberData.id],
        agentIds: [],
        hasAssistantReacted: false,
      },
    ]);

    return () => {
      store.set(currentAiChatThreadState.atom, previousCurrentThread);
      store.set(agentChatDisplayedThreadState.atom, previousDisplayedThread);
      store.set(currentWorkspaceState.atom, previousWorkspace);
      store.set(currentWorkspaceMemberState.atom, previousMember);
      store.set(currentWorkspaceMembersState.atom, previousMembers);
      store.set(agentChatThreadVisitState.atom, previousVisit);
      store.set(messagesAtom, []);
      store.set(reactionsAtom, []);
    };
  }, [messages, isInboxEnabled, store]);

  return null;
};

const AgentChatMessagesDecorator: Decorator = (Story, { parameters }) => (
  <>
    <AgentChatMessagesSetterEffect
      messages={parameters.messages ?? allMockMessages}
      isInboxEnabled={parameters.isInboxEnabled ?? false}
    />
    <Suspense fallback={<MarkdownLoadingSkeleton />}>
      <Story />
    </Suspense>
  </>
);

const meta: Meta<typeof AiChatMessage> = {
  title: 'Modules/AI/AiChatMessage',
  component: AiChatMessage,
  decorators: [
    ComponentDecorator,
    RootDecorator,
    ToastDecorator,
    AgentChatMessagesDecorator,
  ],
  parameters: {
    container: { width: 700 },
  },
};

export default meta;
type Story = StoryObj<typeof AiChatMessage>;

export const ConversationWithCodeExecution: Story = {
  render: () => (
    <StyledConversationContainer>
      <AiChatMessage messageId={mockUserMessage.id} />
      <AiChatMessage messageId={mockAssistantWithCodeExecution.id} />
    </StyledConversationContainer>
  ),
};

export const UserMessage: Story = {
  render: () => <AiChatMessage messageId={mockUserMessage.id} />,
};

export const AssistantTextResponse: Story = {
  render: () => <AiChatMessage messageId={mockSimpleTextResponse.id} />,
};

export const AssistantStreaming: Story = {
  render: () => <AiChatMessage messageId={mockStreamingMessage.id} />,
};

export const CodeExecutionRunning: Story = {
  render: () => <AiChatMessage messageId={mockCodeExecutionRunning.id} />,
};

export const CodeExecutionWithError: Story = {
  render: () => <AiChatMessage messageId={mockCodeExecutionError.id} />,
};

export const ThinkingStepsThinkingState: Story = {
  render: () => <AiChatMessage messageId={mockThinkingStepsStreaming.id} />,
};

export const ThinkingStepsDoneCollapsed: Story = {
  render: () => <AiChatMessage messageId={mockThinkingStepsDone.id} />,
};

export const ThinkingStepsDoneExpanded: Story = {
  render: () => <AiChatMessage messageId={mockThinkingStepsDone.id} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const summaryButton = await canvas.findByRole('button', {
      name: /worked for 1m 23s/i,
    });

    await userEvent.click(summaryButton);
  },
};

export const AnsweredForm: Story = {
  render: () => <AiChatMessage messageId={mockAnsweredForm.id} />,
};

export const MultiplayerConversation: Story = {
  parameters: {
    isInboxEnabled: true,
    messages: [mockUserMessage, mockTeammateMessage, mockSimpleTextResponse],
  },
  render: () => (
    <StyledConversationContainer>
      <AiChatMessage messageId={mockUserMessage.id} />
      <AiChatMessage messageId={mockTeammateMessage.id} />
      <AiChatMessage messageId={mockSimpleTextResponse.id} />
    </StyledConversationContainer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Marco Rossi')).toBeVisible();
    await expect(await canvas.findByText('Assistant')).toBeVisible();
    const unreadSeparator = canvas.getByRole('separator', { name: 'New' });
    await expect(unreadSeparator).toBeVisible();
    await expect(unreadSeparator).toHaveAttribute(
      'aria-orientation',
      'horizontal',
    );
    const selectedReaction = canvas.getByRole('button', { name: '👍 by You' });
    await expect(selectedReaction).toBeVisible();
    selectedReaction.focus();
    await userEvent.tab();
    const addReactionButton = canvas.getAllByRole('button', {
      name: 'Add reaction',
    })[1];
    await expect(addReactionButton).toHaveFocus();
    await waitFor(() => expect(addReactionButton).toBeVisible());
  },
};

export const SenderFallbacks: Story = {
  parameters: { isInboxEnabled: true },
  render: () => (
    <StyledConversationContainer>
      <AiChatMessage messageId={mockFormerMemberMessage.id} />
      <AiChatMessage messageId={mockUnknownSenderMessage.id} />
      <AiChatMessage messageId={mockNamedAssistantMessage.id} />
    </StyledConversationContainer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Former member')).toBeVisible();
    await expect(canvas.getByText('Unknown sender')).toBeVisible();
    await expect(canvas.getByText('Marco Rossi')).toBeVisible();
    await expect(canvas.queryByText('Ada')).not.toBeInTheDocument();
  },
};
