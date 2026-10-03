import { getAskedQuestionEntries } from '@/ai/utils/getAskedQuestionEntries';

const PLAN = {
  header: 'Plan',
  question: 'Which plan?',
  options: [{ label: 'Pro' }, { label: 'Team' }],
};

const SEATS = {
  header: 'Seats',
  question: 'How many seats?',
  options: [{ label: '10' }, { label: '50' }],
};

describe('getAskedQuestionEntries', () => {
  it('reads nothing while the call has no result yet', () => {
    expect(getAskedQuestionEntries(undefined)).toEqual([]);
  });

  it('reads the answer of an ask_question call', () => {
    expect(
      getAskedQuestionEntries({
        question: PLAN,
        status: 'answered',
        answer: { selectedOptionIndices: [1] },
      }),
    ).toEqual([{ question: PLAN, answer: { selectedOptionIndices: [1] } }]);
  });

  it('pairs each question of an older call with its answer', () => {
    expect(
      getAskedQuestionEntries({
        questions: [PLAN, SEATS],
        status: 'answered',
        answers: [{ questionIndex: 1, selectedOptionIndices: [0] }],
      }),
    ).toEqual([
      { question: PLAN, answer: undefined },
      {
        question: SEATS,
        answer: { questionIndex: 1, selectedOptionIndices: [0] },
      },
    ]);
  });
});
