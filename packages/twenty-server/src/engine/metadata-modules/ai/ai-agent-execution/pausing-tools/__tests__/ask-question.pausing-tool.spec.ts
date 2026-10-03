import { ASK_QUESTION_PAUSING_TOOL } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/ask-question.pausing-tool';

const QUESTION = {
  header: 'Add-ons',
  question: 'Which add-ons?',
  options: [{ label: 'SSO' }, { label: 'Audit log' }],
  allowMultiSelect: true,
};

const NO_TOOLS = { executeTool: jest.fn() };

const parseCall = (question: Record<string, unknown> = QUESTION) => {
  const call = ASK_QUESTION_PAUSING_TOOL.parseCall(question);

  if (call === null) {
    throw new Error('Expected the call to parse');
  }

  return call;
};

describe('ASK_QUESTION_PAUSING_TOOL', () => {
  it('cannot read a call without options', () => {
    expect(
      ASK_QUESTION_PAUSING_TOOL.parseCall({ ...QUESTION, options: [] }),
    ).toBeNull();
    expect(ASK_QUESTION_PAUSING_TOOL.parseCall(undefined)).toBeNull();
  });

  it('turns an answer into the answered result and the answer message', async () => {
    const answer = { selectedOptionIndices: [0, 1] };

    expect(parseCall().validate(answer)).toEqual({
      isValid: true,
      output: answer,
    });
    expect(
      await parseCall().complete({ output: answer, context: NO_TOOLS }),
    ).toEqual({
      toolResult: {
        success: true,
        message: 'User answered the question.',
        result: { question: QUESTION, status: 'answered', answer },
      },
      answerText: 'Which add-ons?\nSSO, Audit log',
    });
  });

  it('prefers free text in the answer message', async () => {
    const completion = await parseCall().complete({
      output: { selectedOptionIndices: [0], freeText: ' Both ' },
      context: NO_TOOLS,
    });

    expect(completion.answerText).toBe('Which add-ons?\nBoth');
  });

  it.each([
    ['an empty answer', { selectedOptionIndices: [], freeText: '  ' }],
    ['an unknown option', { selectedOptionIndices: [2] }],
  ])('refuses %s', (_case, answer) => {
    expect(parseCall().validate(answer).isValid).toBe(false);
  });

  it('refuses several options for a single-select question', () => {
    const call = parseCall({ ...QUESTION, allowMultiSelect: false });

    expect(call.validate({ selectedOptionIndices: [0, 1] }).isValid).toBe(
      false,
    );
  });

  it('closes a skipped call with its question', () => {
    expect(parseCall().toSkippedToolResult()).toEqual({
      success: true,
      message: 'User skipped the question and sent another message instead.',
      result: { question: QUESTION, status: 'skipped' },
    });
  });
});
