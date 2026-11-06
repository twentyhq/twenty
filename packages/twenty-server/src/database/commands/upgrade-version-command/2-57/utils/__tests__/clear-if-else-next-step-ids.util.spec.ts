import { clearIfElseNextStepIds } from 'src/database/commands/upgrade-version-command/2-57/utils/clear-if-else-next-step-ids.util';

const ifElseStep = (nextStepIds?: string[] | null) => ({
  id: 'if-else',
  type: 'IF_ELSE',
  nextStepIds,
  settings: {
    input: {
      branches: [
        { id: 'if', nextStepIds: ['a'] },
        { id: 'else', nextStepIds: ['b'] },
      ],
    },
  },
});

describe('clearIfElseNextStepIds', () => {
  it('clears the next steps an If/Else lists outside its branches', () => {
    expect(
      clearIfElseNextStepIds([
        ifElseStep(['dead']),
        { id: 'code', type: 'CODE', nextStepIds: ['a'] },
      ]),
    ).toEqual({
      steps: [ifElseStep([]), { id: 'code', type: 'CODE', nextStepIds: ['a'] }],
      hasChanged: true,
      clearedNextStepIds: [{ stepId: 'if-else', nextStepIds: ['dead'] }],
    });
  });

  it.each([[[]], [null], [undefined]])(
    'leaves an If/Else whose next steps are %p unchanged',
    (nextStepIds) => {
      const steps = [ifElseStep(nextStepIds)];

      expect(clearIfElseNextStepIds(steps)).toEqual({
        steps,
        hasChanged: false,
        clearedNextStepIds: [],
      });
    },
  );

  it('leaves other steps and values that are not step lists unchanged', () => {
    expect(
      clearIfElseNextStepIds([
        { id: 'code', type: 'CODE', nextStepIds: ['a'] },
        'not a step',
      ]).hasChanged,
    ).toBe(false);
    expect(clearIfElseNextStepIds(null)).toEqual({
      steps: null,
      hasChanged: false,
      clearedNextStepIds: [],
    });
  });
});
