import { MockedProvider } from '@apollo/client/testing/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { createStore, Provider } from 'jotai';
import { type ReactNode, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { AiChatContextUsageButton } from '@/ai/components/internal/AiChatContextUsageButton';
import { AiChatContextUsageDetails } from '@/ai/components/internal/AiChatContextUsageDetails';
import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import {
  agentChatUsageComponentFamilyState,
  type AgentChatUsageState,
} from '@/ai/states/agentChatUsageComponentFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { GetAiChatUsageDocument } from '~/generated-metadata/graphql';

const USAGE: AgentChatUsageState = {
  conversationSize: 200000,
  contextWindowTokens: 1000000,
  inputTokens: 200000,
  outputTokens: 40000,
  cachedInputTokens: 75000,
  inputCredits: 80,
  outputCredits: 20,
  lastMessage: {
    inputTokens: 100000,
    outputTokens: 20000,
    cachedInputTokens: 50000,
    inputCredits: 40,
    outputCredits: 10,
  },
};

const UsageStory = ({
  usage = null,
  limit = 1000,
  consumed = 800,
  error = false,
  loading = false,
  children,
}: {
  usage?: AgentChatUsageState | null;
  limit?: number | null;
  consumed?: number | null;
  error?: boolean;
  loading?: boolean;
  children?: ReactNode;
}) => {
  const [store] = useState(() => {
    const storyStore = createStore();
    storyStore.set(currentAiChatThreadState.atom, 'story-thread');
    storyStore.set(
      agentChatUsageComponentFamilyState.atomFamily({
        instanceId: 'usage-story',
        familyKey: { threadId: 'story-thread' },
      }),
      usage,
    );
    return storyStore;
  });
  return (
    <Provider store={store}>
      <AgentChatComponentInstanceContext.Provider
        value={{ instanceId: 'usage-story' }}
      >
        <MockedProvider
          mocks={[
            {
              request: { query: GetAiChatUsageDocument },
              maxUsageCount: Infinity,
              delay: loading ? Infinity : 0,
              ...(error
                ? { error: new Error('Usage unavailable') }
                : {
                    result: {
                      data: {
                        aiChatUsage:
                          limit === null
                            ? null
                            : {
                                limitValue: limit,
                                consumedValue: consumed,
                                periodEnd: null,
                                isUsageLimit: false,
                              },
                      },
                    },
                  }),
            },
          ]}
        >
          {children ?? <AiChatContextUsageButton />}
        </MockedProvider>
      </AgentChatComponentInstanceContext.Provider>
    </Provider>
  );
};

const meta = {
  title: 'Modules/AI/AiChatContextUsageButton',
  component: AiChatContextUsageButton,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 400, height: 650 } },
} satisfies Meta<typeof AiChatContextUsageButton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const NewChat: Story = {
  render: () => <UsageStory />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Context and usage' }),
    );
    await waitFor(() => expect(page.getByText('80%')).toBeVisible());
    await expect(
      page.queryByRole('button', { name: /^More/ }),
    ).not.toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(page.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};
export const Expanded: Story = {
  render: () => <UsageStory usage={USAGE} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.tab();
    await waitFor(() => expect(page.getByRole('dialog')).toBeVisible());
    await userEvent.click(page.getByRole('button', { name: /^More/ }));
    await expect(page.getByText('Last message')).toBeVisible();
    await expect(page.getByText('Conversation')).toBeVisible();
    await expect(page.getAllByText('Cached input')).toHaveLength(2);
    await expect(page.getByText('50k')).toBeVisible();
    await expect(page.getByText('75k')).toBeVisible();
    await userEvent.click(page.getByRole('button', { name: /^Less/ }));
    await expect(page.queryByText('Last message')).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Context and usage' }),
    );
  },
};
export const ReopenedConversation: Story = {
  render: () => <UsageStory usage={{ ...USAGE, lastMessage: null }} />,
};
export const NoLimit: Story = { render: () => <UsageStory limit={null} /> };
export const UnknownConsumption: Story = {
  render: () => <UsageStory consumed={null} />,
};
export const Exhausted: Story = {
  render: () => <UsageStory limit={0} consumed={0} />,
};
export const Unavailable: Story = { render: () => <UsageStory error /> };
export const Loading: Story = { render: () => <UsageStory loading /> };
export const Details: Story = {
  render: () => (
    <UsageStory usage={USAGE}>
      <AiChatContextUsageDetails />
    </UsageStory>
  ),
};
