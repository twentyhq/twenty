import { describe, expect, it } from 'vitest';

import { type OrchestratorStateEntityInfo } from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';
import { summarizeEntityStatuses } from '@/cli/utilities/dev/ui/dev-ui-constants';

const entity = (
  name: string,
  status: OrchestratorStateEntityInfo['status'],
): OrchestratorStateEntityInfo => ({ name, path: name, status });

describe('summarizeEntityStatuses', () => {
  it('counts every status in display order', () => {
    const parts = summarizeEntityStatuses([
      entity('a', 'success'),
      entity('b', 'success'),
      entity('c', 'error'),
      entity('d', 'building'),
    ]);

    expect(parts).toEqual([
      { status: 'success', count: 2, label: 'synced' },
      { status: 'building', count: 1, label: 'building' },
      { status: 'error', count: 1, label: 'error' },
    ]);
  });

  it('returns only the non-zero statuses', () => {
    const parts = summarizeEntityStatuses([
      entity('a', 'success'),
      entity('b', 'success'),
    ]);

    expect(parts).toEqual([{ status: 'success', count: 2, label: 'synced' }]);
  });
});
