import { describe, expect, it } from 'vitest';

import { assertAllWorkflowsSeeded } from 'src/logic-functions/utils/assert-all-workflows-seeded';

describe('assertAllWorkflowsSeeded', () => {
  it('passes when every workflow was created or skipped', () => {
    expect(() =>
      assertAllWorkflowsSeeded({
        seededWorkflows: [
          {
            objectNameSingular: 'company',
            workflowName: 'A',
            status: 'created',
          },
          {
            objectNameSingular: 'person',
            workflowName: 'B',
            status: 'skipped',
          },
        ],
      }),
    ).not.toThrow();
  });

  it('throws naming every workflow that failed and why', () => {
    expect(() =>
      assertAllWorkflowsSeeded({
        seededWorkflows: [
          {
            objectNameSingular: 'company',
            workflowName: 'A',
            status: 'created',
          },
          {
            objectNameSingular: 'person',
            workflowName: 'B',
            status: 'failed',
            error: 'no active version',
          },
        ],
      }),
    ).toThrow(
      /1 enrichment workflow\(s\) could not be seeded: B: no active version/,
    );
  });

  it('falls back to a placeholder when a failure carries no error', () => {
    expect(() =>
      assertAllWorkflowsSeeded({
        seededWorkflows: [
          {
            objectNameSingular: 'company',
            workflowName: 'A',
            status: 'failed',
          },
        ],
      }),
    ).toThrow(/A: unknown error/);
  });
});
