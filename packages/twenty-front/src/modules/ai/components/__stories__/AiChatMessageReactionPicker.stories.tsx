import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useStore } from 'jotai';
import { graphql, http, HttpResponse, passthrough } from 'msw';
import { useEffect } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatMessageReactionPicker } from '@/ai/components/AiChatMessageReactionPicker';
import { AiChatMessageReactions } from '@/ai/components/AiChatMessageReactions';
import { AGENT_CHAT_EMOJIBASE_URL } from '@/ai/constants/AgentChatEmojibaseUrl';
import { agentChatMessageReactionsFamilyState } from '@/ai/states/agentChatMessageReactionsFamilyState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedWorkspaceMemberData } from '~/testing/mock-data/users';

const MESSAGE_ID = '20202020-f838-4ff1-a1b0-9dcf71e2e1cd';
const addReaction = fn();
const removeReaction = fn();

const StyledReactions = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const ReactionStateEffect = () => {
  const store = useStore();

  useEffect(() => {
    const previousMember = store.get(currentWorkspaceMemberState.atom);
    const reactionsAtom = agentChatMessageReactionsFamilyState.atomFamily({
      messageId: MESSAGE_ID,
    });

    store.set(currentWorkspaceMemberState.atom, mockedWorkspaceMemberData);
    store.set(reactionsAtom, []);

    return () => {
      store.set(currentWorkspaceMemberState.atom, previousMember);
      store.set(reactionsAtom, []);
    };
  }, [store]);

  return null;
};

const meta: Meta<typeof AiChatMessageReactionPicker> = {
  title: 'Modules/AI/AiChatMessageReactionPicker',
  component: AiChatMessageReactionPicker,
  decorators: [
    (Story) => (
      <>
        <ReactionStateEffect />
        <StyledReactions>
          <AiChatMessageReactions messageId={MESSAGE_ID} />
          <Story />
        </StyledReactions>
      </>
    ),
    ToastDecorator,
    RootDecorator,
    ComponentDecorator,
  ],
  args: { messageId: MESSAGE_ID },
  beforeEach: () => {
    addReaction.mockClear();
    removeReaction.mockClear();
  },
  parameters: {
    container: { width: 400, height: 380 },
    msw: {
      handlers: [
        http.all(`${AGENT_CHAT_EMOJIBASE_URL}/en/:filename`, () =>
          passthrough(),
        ),
        graphql.mutation('AddAgentChatMessageReaction', ({ variables }) => {
          addReaction(variables);

          return HttpResponse.json({
            data: {
              addAgentChatMessageReaction: [
                {
                  emoji: variables.emoji,
                  workspaceMemberIds: [mockedWorkspaceMemberData.id],
                  agentIds: [],
                  hasAssistantReacted: false,
                },
              ],
            },
          });
        }),
        graphql.mutation('RemoveAgentChatMessageReaction', ({ variables }) => {
          removeReaction(variables);

          return HttpResponse.json({
            data: { removeAgentChatMessageReaction: [] },
          });
        }),
        ...graphqlMocks.handlers,
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof AiChatMessageReactionPicker>;

export const ToggleQuickReaction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Add reaction' }));
    const picker = within(
      await body.findByRole('dialog', { name: 'Add reaction' }),
    );

    expect(
      picker.queryByPlaceholderText('Search emojis'),
    ).not.toBeInTheDocument();
    await userEvent.click(picker.getByRole('button', { name: '✅' }));
    await waitFor(() =>
      expect(addReaction).toHaveBeenCalledWith({
        messageId: MESSAGE_ID,
        emoji: '✅',
      }),
    );

    const reaction = await canvas.findByRole('button', { name: '✅ by You' });
    expect(reaction).toHaveAttribute('aria-pressed', 'true');
    expect(reaction).toHaveTextContent('✅1');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );

    await userEvent.click(reaction);
    await waitFor(() =>
      expect(removeReaction).toHaveBeenCalledWith({
        messageId: MESSAGE_ID,
        emoji: '✅',
      }),
    );
    expect(
      canvas.queryByRole('button', { name: '✅ by You' }),
    ).not.toBeInTheDocument();
  },
};

export const MoreReactions: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Add reaction' });

    await userEvent.click(trigger);
    await userEvent.click(
      await body.findByRole('button', { name: 'More reactions' }),
    );
    const search = await body.findByPlaceholderText('Search emojis');

    await expect(search).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await userEvent.click(trigger);
    await expect(
      await body.findByRole('button', { name: 'More reactions' }),
    ).toBeVisible();
    expect(
      body.queryByPlaceholderText('Search emojis'),
    ).not.toBeInTheDocument();
  },
};
