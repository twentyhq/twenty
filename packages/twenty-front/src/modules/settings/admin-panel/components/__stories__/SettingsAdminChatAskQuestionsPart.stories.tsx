import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { type AskQuestionsToolResult } from 'twenty-shared/ai';
import { ComponentDecorator } from 'twenty-ui/testing';

import { SettingsAdminChatAskQuestionsPart } from '@/settings/admin-panel/components/SettingsAdminChatAskQuestionsPart';
import { type AdminChatThreadMessagePart } from '@/settings/admin-panel/types/AdminChatThreadMessagePart';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

const QUESTIONS = [
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
  {
    header: 'Channels',
    question: 'Which channels does your team rely on?',
    options: [
      { label: 'Email', description: 'Gmail or Outlook mailboxes.' },
      { label: 'Calendar' },
      { label: 'Phone' },
    ],
    allowMultiSelect: true,
  },
];

const buildPart = (
  result: AskQuestionsToolResult,
): AdminChatThreadMessagePart =>
  ({
    type: 'tool-ask_questions',
    orderIndex: 0,
    toolName: 'ask_questions',
    toolCallId: 'call-1',
    toolInput: { questions: result.questions },
    toolOutput: { success: true, message: 'Questions presented.', result },
    state: 'output-available',
    errorMessage: null,
    textContent: null,
    reasoningContent: null,
  }) as AdminChatThreadMessagePart;

const meta: Meta<typeof SettingsAdminChatAskQuestionsPart> = {
  title: 'Modules/Settings/AdminPanel/SettingsAdminChatAskQuestionsPart',
  component: SettingsAdminChatAskQuestionsPart,
  decorators: [SnackBarDecorator, ComponentDecorator],
  parameters: { container: { width: 700 } },
  argTypes: { part: { control: false }, result: { control: false } },
};

export default meta;
type Story = StoryObj<typeof SettingsAdminChatAskQuestionsPart>;

const answeredResult: AskQuestionsToolResult = {
  questions: QUESTIONS,
  status: 'answered',
  answers: [
    { questionIndex: 0, selectedOptionIndices: [1] },
    { questionIndex: 1, selectedOptionIndices: [0, 2] },
  ],
};

const freeTextResult: AskQuestionsToolResult = {
  questions: [QUESTIONS[0]],
  status: 'answered',
  answers: [
    {
      questionIndex: 0,
      selectedOptionIndices: [],
      freeText: 'A re-engagement email for churned customers.',
    },
  ],
};

const pendingResult: AskQuestionsToolResult = {
  questions: [QUESTIONS[0]],
  status: 'pending',
};

export const Answered: Story = {
  args: { part: buildPart(answeredResult), result: answeredResult },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Answered')).toBeInTheDocument();

    for (const question of QUESTIONS) {
      expect(await canvas.findByText(question.question)).toBeInTheDocument();
      expect(await canvas.findByText(question.header)).toBeInTheDocument();

      for (const option of question.options) {
        expect(await canvas.findByText(option.label)).toBeInTheDocument();
      }
    }

    expect(
      await canvas.findByText('A short, friendly note to introduce yourself.'),
    ).toBeInTheDocument();
    expect(await canvas.findByText('· Recommended')).toBeInTheDocument();
    expect(await canvas.findByText('Multiple answers')).toBeInTheDocument();
  },
};

export const AnsweredWithFreeText: Story = {
  args: { part: buildPart(freeTextResult), result: freeTextResult },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Other')).toBeInTheDocument();
    expect(
      await canvas.findByText('A re-engagement email for churned customers.'),
    ).toBeInTheDocument();
  },
};

export const Unanswered: Story = {
  args: { part: buildPart(pendingResult), result: pendingResult },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Unanswered')).toBeInTheDocument();
    expect(
      await canvas.findByText('A presentation of Twenty'),
    ).toBeInTheDocument();
  },
};
