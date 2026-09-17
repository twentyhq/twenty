import { getShouldFocusNodeTab } from '@/side-panel/pages/workflow/step/view-run/utils/getShouldFocusNodeTab';

describe('getShouldFocusNodeTab', () => {
  it.each([
    ['FORM', 'PENDING', true],
    ['AI_AGENT', 'PENDING', true],
    ['AI_AGENT', 'SUCCESS', false],
    ['FORM', 'SUCCESS', false],
    ['CODE', 'PENDING', false],
  ] as const)(
    'focuses the node tab for %s steps in %s status: %s',
    (actionType, stepExecutionStatus, expected) => {
      expect(
        getShouldFocusNodeTab({ actionType, stepExecutionStatus }),
      ).toBe(expected);
    },
  );
});
