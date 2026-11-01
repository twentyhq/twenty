import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useStore } from 'jotai';
import { useEffect } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatQuestionCard } from '@/ai/components/AiChatQuestionCard';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { type AgentChatPendingQuestion } from '@/ai/types/AgentChatPendingQuestion';

import { styled } from '@linaria/react';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const StyledContainer = styled.div`
  max-width: 400px;
  padding: 24px;
`;

const EMAIL_TYPE_QUESTION = {
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
};

const singleQuestion: AgentChatPendingQuestion = {
  toolCallId: 'call-1',
  kind: 'question',
  question: EMAIL_TYPE_QUESTION,
};

const TONE_QUESTION = {
  header: 'Tone',
  question: 'Which tone should the email use?',
  options: [{ label: 'Friendly', isRecommended: true }, { label: 'Formal' }],
};

// calls asked before ask_question took one question at a time
const multipleQuestions: AgentChatPendingQuestion = {
  toolCallId: 'call-2',
  kind: 'questions',
  questions: [EMAIL_TYPE_QUESTION, TONE_QUESTION],
};

const longQuestion: AgentChatPendingQuestion = {
  toolCallId: 'call-3',
  kind: 'questions',
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
    TONE_QUESTION,
  ],
};

const multiSelectQuestion: AgentChatPendingQuestion = {
  toolCallId: 'call-4',
  kind: 'question',
  question: {
    header: 'Channels',
    question: 'Which channels should the outreach campaign use?',
    allowMultiSelect: true,
    options: [
      { label: 'Email', isRecommended: true },
      { label: 'LinkedIn' },
      { label: 'Phone' },
    ],
  },
};

const StoreSeederEffect = () => {
  const store = useStore();

  useEffect(() => {
    store.set(currentAiChatThreadState.atom, 'thread-1');
    store.set(agentChatDisplayedThreadState.atom, 'thread-1');
  }, [store]);

  return null;
};

const meta: Meta<typeof AiChatQuestionCard> = {
  title: 'Modules/AiChat/AiChatQuestionCard',
  component: AiChatQuestionCard,
  decorators: [
    (Story) => (
      <StyledContainer>
        <StoreSeederEffect />
        <Story />
      </StyledContainer>
    ),
    ToastDecorator,
    ComponentDecorator,
    MemoryRouterDecorator,
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const previous = await canvas.findByRole('button', { name: 'Previous' });
    const next = canvas.getByRole('button', { name: 'Next question' });

    expect(previous).toBeDisabled();
    expect(canvas.getByText('1/2')).toBeVisible();
    await userEvent.type(
      canvas.getByPlaceholderText('Type your own answer here'),
      'Welcome email draft',
    );
    await userEvent.click(next);

    expect(canvas.getByText(TONE_QUESTION.question)).toBeVisible();
    expect(canvas.getByText('2/2')).toBeVisible();
    expect(next).toBeDisabled();
    await userEvent.type(
      canvas.getByPlaceholderText('Type your own answer here'),
      'Friendly tone draft',
    );
    await userEvent.click(previous);

    expect(canvas.getByText(EMAIL_TYPE_QUESTION.question)).toBeVisible();
    expect(
      canvas.getByPlaceholderText('Type your own answer here'),
    ).toHaveValue('Welcome email draft');
    await userEvent.click(next);
    expect(
      canvas.getByPlaceholderText('Type your own answer here'),
    ).toHaveValue('Friendly tone draft');
  },
};

export const LongQuestion: Story = {
  args: { pendingQuestion: longQuestion },
};

export const MultiSelectQuestion: Story = {
  args: { pendingQuestion: multiSelectQuestion },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const emailOption = await canvas.findByRole('button', { name: /Email/ });
    await userEvent.click(emailOption);

    const otherOption = await canvas.findByRole('button', { name: 'Other' });
    expect(otherOption).toHaveAttribute('aria-pressed', 'false');

    const otherTextArea = canvas.getByPlaceholderText(
      'Type your own answer here',
    );
    otherTextArea.focus();
    await userEvent.type(otherTextArea, 'Carrier pigeon', { skipClick: true });
    expect(otherOption).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(otherOption);
    expect(otherOption).toHaveAttribute('aria-pressed', 'false');
    expect(otherTextArea).toHaveValue('Carrier pigeon');

    await userEvent.click(otherOption);
    expect(otherOption).toHaveAttribute('aria-pressed', 'true');
  },
};

export const SkipQuestion: Story = {
  args: { pendingQuestion: singleQuestion, onSkip: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByRole('button', { name: 'Skip' }));
    expect(args.onSkip).toHaveBeenCalledOnce();
    expect(canvas.getByText(EMAIL_TYPE_QUESTION.question)).toBeVisible();
  },
};
