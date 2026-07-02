import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useStore } from 'jotai';
import { type ReactNode, useEffect } from 'react';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatQuestionCard } from '@/ai/components/AiChatQuestionCard';
import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { type AgentChatPendingQuestion } from '@/ai/types/AgentChatPendingQuestion';

import { styled } from '@linaria/react';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

const StyledContainer = styled.div`
  max-width: 400px;
  padding: 24px;
`;

const INSTANCE_ID = 'agentChatQuestionCardStory';

const singleQuestion: AgentChatPendingQuestion = {
  messageId: 'assistant-1',
  toolCallId: 'call-1',
  questions: [
    {
      header: 'Email type',
      question: 'What type of emails would you like to send?',
      options: [
        {
          label: 'A welcome email',
          description: 'A short, friendly note to introduce yourself.',
          isRecommended: true,
        },
        { label: 'A presentation of Twenty' },
        { label: 'An offer for a potential partnership' },
      ],
    },
  ],
};

const multipleQuestions: AgentChatPendingQuestion = {
  messageId: 'assistant-1',
  toolCallId: 'call-2',
  questions: [
    singleQuestion.questions[0],
    {
      header: 'Tone',
      question: 'Which tone should the email use?',
      options: [
        { label: 'Friendly', isRecommended: true },
        { label: 'Formal' },
      ],
    },
  ],
};

const longQuestion: AgentChatPendingQuestion = {
  messageId: 'assistant-1',
  toolCallId: 'call-3',
  questions: [
    {
      header: 'Improvement',
      question:
        'What is the one improvement you would make to the "Send follow-up emails to stale opportunities" workflow before we roll it out to the whole team?',
      options: [
        { label: 'Wording clarity' },
        { label: 'Better layout' },
        { label: 'More flexibility', isRecommended: true },
        { label: 'Fewer steps' },
      ],
    },
    multipleQuestions.questions[1],
  ],
};

const StoreSeeder = ({ children }: { children: ReactNode }) => {
  const store = useStore();

  useEffect(() => {
    store.set(currentAiChatThreadState.atom, 'thread-1');
    store.set(agentChatDisplayedThreadState.atom, 'thread-1');
  }, [store]);

  return <>{children}</>;
};

const meta: Meta<typeof AiChatQuestionCard> = {
  title: 'Modules/AiChat/AiChatQuestionCard',
  component: AiChatQuestionCard,
  decorators: [
    (Story) => (
      <AgentChatComponentInstanceContext.Provider
        value={{ instanceId: INSTANCE_ID }}
      >
        <StoreSeeder>
          <StyledContainer>
            <Story />
          </StyledContainer>
        </StoreSeeder>
      </AgentChatComponentInstanceContext.Provider>
    ),
    SnackBarDecorator,
    ComponentDecorator,
    RootDecorator,
  ],
};

export default meta;

type Story = StoryObj<typeof AiChatQuestionCard>;

export const SingleQuestion: Story = {
  args: { pendingQuestion: singleQuestion },
};

export const MultipleQuestions: Story = {
  args: { pendingQuestion: multipleQuestions },
};

export const LongQuestion: Story = {
  args: { pendingQuestion: longQuestion },
};
