import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { markQuestionAnswered } from '@/ai/utils/markQuestionAnswered';

const buildMessages = (status: 'pending' | 'answered'): ExtendedUIMessage[] => [
  {
    id: 'assistant-1',
    role: 'assistant',
    parts: [
      {
        type: 'tool-ask_questions',
        toolCallId: 'call-1',
        state: 'output-available',
        input: { questions: [] },
        output: {
          success: true,
          message: 'x',
          result: {
            questions: [
              { header: 'Type', question: 'Which?', options: [{ label: 'A' }] },
            ],
            status,
          },
        },
      },
    ],
    metadata: { createdAt: '2024-01-01T00:00:00.000Z' },
  } as unknown as ExtendedUIMessage,
];

describe('markQuestionAnswered', () => {
  it('flips the matching tool part to answered and stores the answers', () => {
    const answers = [
      { questionIndex: 0, selectedOptionIndices: [0], freeText: undefined },
    ];

    const result = markQuestionAnswered(
      buildMessages('pending'),
      'assistant-1',
      'call-1',
      answers,
    );

    const output = (result[0].parts[0] as { output?: { result?: unknown } })
      .output;

    expect(output).toMatchObject({
      result: { status: 'answered', answers },
    });
  });

  it('preserves the original questions on the resolved part', () => {
    const result = markQuestionAnswered(
      buildMessages('pending'),
      'assistant-1',
      'call-1',
      [{ questionIndex: 0, selectedOptionIndices: [0] }],
    );

    const output = (
      result[0].parts[0] as {
        output?: { result?: { questions?: unknown[] } };
      }
    ).output;

    expect(output?.result?.questions).toHaveLength(1);
  });

  it('leaves non-matching tool calls untouched', () => {
    const result = markQuestionAnswered(
      buildMessages('pending'),
      'assistant-1',
      'other-call',
      [{ questionIndex: 0, selectedOptionIndices: [0] }],
    );

    const output = (
      result[0].parts[0] as { output?: { result?: { status?: string } } }
    ).output;

    expect(output?.result?.status).toBe('pending');
  });
});
