import { ASK_QUESTIONS_TOOL_NAME } from 'twenty-shared/ai';

import { PAUSING_TOOLS } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/pausing-tools.constant';
import { ASK_QUESTIONS_PAUSING_TOOL } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/ask-questions.pausing-tool';

const QUESTIONS = [
  {
    header: 'Plan',
    question: 'Which plan?',
    options: [{ label: 'Pro' }, { label: 'Team' }],
  },
  {
    header: 'Add-ons',
    question: 'Which add-ons?',
    options: [{ label: 'SSO' }, { label: 'Audit log' }],
    allowMultiSelect: true,
  },
];

const parseCall = () => {
  const call = ASK_QUESTIONS_PAUSING_TOOL.parseCall({ questions: QUESTIONS });

  if (call === null) {
    throw new Error('Expected the call to parse');
  }

  return call;
};

describe('ASK_QUESTIONS_PAUSING_TOOL', () => {
  it('is the pausing tool declared for ask_questions', () => {
    expect(PAUSING_TOOLS.get(ASK_QUESTIONS_TOOL_NAME)).toBe(
      ASK_QUESTIONS_PAUSING_TOOL,
    );
  });

  it('waits on a call whose result is still pending', () => {
    expect(
      ASK_QUESTIONS_PAUSING_TOOL.isAwaitingOutput({
        result: { questions: QUESTIONS, status: 'pending' },
      }),
    ).toBe(true);
    expect(
      ASK_QUESTIONS_PAUSING_TOOL.isAwaitingOutput({
        result: { questions: QUESTIONS, status: 'answered' },
      }),
    ).toBe(false);
    expect(ASK_QUESTIONS_PAUSING_TOOL.isAwaitingOutput(undefined)).toBe(false);
  });

  it('cannot read a call without questions', () => {
    expect(ASK_QUESTIONS_PAUSING_TOOL.parseCall({ questions: [] })).toBeNull();
    expect(ASK_QUESTIONS_PAUSING_TOOL.parseCall(undefined)).toBeNull();
  });

  it('asks the first question as the Ask name and keeps every question as its form', () => {
    expect(parseCall().buildAsk()).toEqual({
      name: 'Which plan?',
      form: { kind: 'questions', questions: QUESTIONS },
    });
  });

  const NO_TOOLS = { executeTool: jest.fn() };

  it('turns an accepted answer into the answered result and the answer message', async () => {
    const answers = [
      { questionIndex: 0, selectedOptionIndices: [1] },
      { questionIndex: 1, selectedOptionIndices: [0, 1] },
    ];
    const call = parseCall();

    expect(call.validate({ answers })).toEqual({
      isValid: true,
      output: { answers },
    });
    expect(await call.complete({ answers }, NO_TOOLS)).toEqual({
      toolResult: {
        success: true,
        message: 'User answered the questions.',
        result: { questions: QUESTIONS, status: 'answered', answers },
      },
      answerText: 'Which plan?\nTeam\n\nWhich add-ons?\nSSO, Audit log',
    });
    expect(NO_TOOLS.executeTool).not.toHaveBeenCalled();
  });

  it('prefers free text and leaves unanswered questions out of the answer message', async () => {
    const completion = await parseCall().complete(
      {
        answers: [
          { questionIndex: 0, selectedOptionIndices: [0], freeText: ' Both ' },
          { questionIndex: 1, selectedOptionIndices: [] },
        ],
      },
      NO_TOOLS,
    );

    expect(completion.answerText).toBe('Which plan?\nBoth');
  });

  it.each([
    ['no answer at all', { answers: [] }],
    [
      'only blank answers',
      {
        answers: [
          { questionIndex: 0, selectedOptionIndices: [], freeText: '  ' },
        ],
      },
    ],
    [
      'an unknown question',
      { answers: [{ questionIndex: 5, selectedOptionIndices: [0] }] },
    ],
    [
      'an unknown option',
      { answers: [{ questionIndex: 0, selectedOptionIndices: [2] }] },
    ],
    [
      'several options on a single-select question',
      { answers: [{ questionIndex: 0, selectedOptionIndices: [0, 1] }] },
    ],
    [
      'the same question twice',
      {
        answers: [
          { questionIndex: 0, selectedOptionIndices: [0] },
          { questionIndex: 0, selectedOptionIndices: [1] },
        ],
      },
    ],
    ['a malformed output', { answers: 'Team' }],
  ])('refuses %s', (_description, output) => {
    expect(parseCall().validate(output)).toMatchObject({ isValid: false });
  });

  it('closes a skipped call with its questions', () => {
    expect(parseCall().toSkippedToolResult()).toMatchObject({
      result: { questions: QUESTIONS, status: 'skipped' },
    });
  });
});
