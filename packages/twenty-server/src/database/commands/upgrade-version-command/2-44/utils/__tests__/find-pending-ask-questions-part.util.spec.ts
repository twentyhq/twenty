import { findPendingAskQuestionsPart } from 'src/database/commands/upgrade-version-command/2-44/utils/find-pending-ask-questions-part.util';

const QUESTIONS = [
  { header: 'Quote', question: 'Send it?', options: [{ label: 'Yes' }] },
];

const askQuestionsPart = (status: string) => ({
  toolName: 'ask_questions',
  toolCallId: 'call-1',
  toolOutput: { success: true, result: { questions: QUESTIONS, status } },
});

describe('findPendingAskQuestionsPart', () => {
  it('finds the ask_questions call still waiting on an answer', () => {
    expect(
      findPendingAskQuestionsPart([
        { toolName: null, toolCallId: null, toolOutput: null },
        askQuestionsPart('pending'),
      ]),
    ).toEqual({ toolCallId: 'call-1', questions: QUESTIONS });
  });

  it.each(['answered', 'skipped'])('ignores a call already %s', (status) => {
    expect(
      findPendingAskQuestionsPart([askQuestionsPart(status)]),
    ).toBeUndefined();
  });

  it('ignores other tools with a pending-looking output', () => {
    expect(
      findPendingAskQuestionsPart([
        { ...askQuestionsPart('pending'), toolName: 'search' },
      ]),
    ).toBeUndefined();
  });
});
