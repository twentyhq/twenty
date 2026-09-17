import { StepStatus } from 'twenty-shared/workflow';

import { getShouldFocusNodeTab } from '@/side-panel/pages/workflow/step/view-run/utils/getShouldFocusNodeTab';

describe('getShouldFocusNodeTab', () => {
  it.each([
    ['FORM', StepStatus.PENDING, true],
    ['AI_AGENT', StepStatus.PENDING, true],
    ['AI_AGENT', StepStatus.SUCCESS, false],
    ['FORM', StepStatus.SUCCESS, false],
    ['CODE', StepStatus.PENDING, false],
  ] as const)(
    'focuses the node tab for %s steps in %s status: %s',
    (actionType, stepExecutionStatus, expected) => {
      expect(getShouldFocusNodeTab({ actionType, stepExecutionStatus })).toBe(
        expected,
      );
    },
  );
});
