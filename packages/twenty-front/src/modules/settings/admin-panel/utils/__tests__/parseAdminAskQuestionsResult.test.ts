import { type AdminChatThreadMessagePart } from '@/settings/admin-panel/types/AdminChatThreadMessagePart';
import { parseAdminAskQuestionsResult } from '@/settings/admin-panel/utils/parseAdminAskQuestionsResult';

const QUESTIONS = [
  {
    header: 'Email type',
    question: 'Which mailbox should we sync?',
    options: [
      { label: 'Work', description: 'Your company inbox', isRecommended: true },
      { label: 'Personal' },
    ],
    allowMultiSelect: false,
  },
];

const buildPart = (
  part: Partial<AdminChatThreadMessagePart>,
): AdminChatThreadMessagePart =>
  ({
    type: 'tool-ask_questions',
    toolName: 'ask_questions',
    toolInput: null,
    toolOutput: null,
    ...part,
  }) as AdminChatThreadMessagePart;

describe('parseAdminAskQuestionsResult', () => {
  it('should parse an answered tool output', () => {
    const result = parseAdminAskQuestionsResult(
      buildPart({
        toolOutput: {
          success: true,
          message: 'User answered the questions.',
          result: {
            questions: QUESTIONS,
            status: 'answered',
            answers: [
              {
                questionIndex: 0,
                selectedOptionIndices: [0],
                freeText: 'Both',
              },
            ],
          },
        },
      }),
    );

    expect(result).toEqual({
      questions: QUESTIONS,
      status: 'answered',
      answers: [
        { questionIndex: 0, selectedOptionIndices: [0], freeText: 'Both' },
      ],
    });
  });

  it('should parse a pending tool output without answers', () => {
    const result = parseAdminAskQuestionsResult(
      buildPart({
        toolOutput: { result: { questions: QUESTIONS, status: 'pending' } },
      }),
    );

    expect(result?.status).toBe('pending');
    expect(result?.answers).toBeUndefined();
  });

  it('should fall back to the tool input when there is no output', () => {
    const result = parseAdminAskQuestionsResult(
      buildPart({ toolInput: { questions: QUESTIONS } }),
    );

    expect(result).toEqual({ questions: QUESTIONS, status: 'pending' });
  });

  it('should parse a JSON string tool output', () => {
    const result = parseAdminAskQuestionsResult(
      buildPart({
        toolOutput: JSON.stringify({
          result: { questions: QUESTIONS, status: 'answered', answers: [] },
        }),
      }),
    );

    expect(result?.questions).toEqual(QUESTIONS);
  });

  it('should preserve an unrecognized status', () => {
    const result = parseAdminAskQuestionsResult(
      buildPart({
        toolOutput: { result: { questions: QUESTIONS, status: 'whatever' } },
      }),
    );

    expect(result?.status).toBe('whatever');
  });

  it('should default to pending when the status is missing', () => {
    const result = parseAdminAskQuestionsResult(
      buildPart({ toolOutput: { result: { questions: QUESTIONS } } }),
    );

    expect(result?.status).toBe('pending');
  });

  it('should return null when an option index is out of range', () => {
    const result = parseAdminAskQuestionsResult(
      buildPart({
        toolOutput: {
          result: {
            questions: QUESTIONS,
            status: 'answered',
            answers: [{ questionIndex: 0, selectedOptionIndices: [5] }],
          },
        },
      }),
    );

    expect(result).toBeNull();
  });

  it('should return null when an option index is not a number', () => {
    const result = parseAdminAskQuestionsResult(
      buildPart({
        toolOutput: {
          result: {
            questions: QUESTIONS,
            status: 'answered',
            answers: [{ questionIndex: 0, selectedOptionIndices: [0, null] }],
          },
        },
      }),
    );

    expect(result).toBeNull();
  });

  it('should not fall back to the tool input when the output answers are malformed', () => {
    const result = parseAdminAskQuestionsResult(
      buildPart({
        toolInput: { questions: QUESTIONS },
        toolOutput: {
          result: {
            questions: QUESTIONS,
            status: 'answered',
            answers: [{ questionIndex: 0, selectedOptionIndices: [5] }],
          },
        },
      }),
    );

    expect(result).toBeNull();
  });

  it('should still fall back to the tool input when the output has no result', () => {
    const result = parseAdminAskQuestionsResult(
      buildPart({
        toolInput: { questions: QUESTIONS },
        toolOutput: { success: true, message: 'Questions presented.' },
      }),
    );

    expect(result).toEqual({ questions: QUESTIONS, status: 'pending' });
  });

  it('should return null when an answer references an unknown question', () => {
    const result = parseAdminAskQuestionsResult(
      buildPart({
        toolOutput: {
          result: {
            questions: QUESTIONS,
            status: 'answered',
            answers: [{ questionIndex: 7, selectedOptionIndices: [0] }],
          },
        },
      }),
    );

    expect(result).toBeNull();
  });

  it('should return null for another tool', () => {
    expect(
      parseAdminAskQuestionsResult(
        buildPart({
          type: 'tool-load_skills',
          toolName: 'load_skills',
          toolOutput: { result: { questions: QUESTIONS, status: 'answered' } },
        }),
      ),
    ).toBeNull();
  });

  it('should return null when no questions can be read', () => {
    expect(
      parseAdminAskQuestionsResult(
        buildPart({ toolOutput: { result: { status: 'answered' } } }),
      ),
    ).toBeNull();
  });

  it('should return null when a question is malformed', () => {
    expect(
      parseAdminAskQuestionsResult(
        buildPart({
          toolOutput: {
            result: {
              questions: [{ question: 'Missing options' }],
              status: 'answered',
            },
          },
        }),
      ),
    ).toBeNull();
  });

  it('should return null when an option is malformed', () => {
    expect(
      parseAdminAskQuestionsResult(
        buildPart({
          toolInput: {
            questions: [{ question: 'Pick one', options: [{ label: 42 }] }],
          },
        }),
      ),
    ).toBeNull();
  });
});
