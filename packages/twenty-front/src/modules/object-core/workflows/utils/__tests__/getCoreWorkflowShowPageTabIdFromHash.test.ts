import { getCoreWorkflowShowPageTabIdFromHash } from '@/object-core/workflows/utils/getCoreWorkflowShowPageTabIdFromHash';

describe('getCoreWorkflowShowPageTabIdFromHash', () => {
  it('selects the tab named in the hash', () => {
    expect(getCoreWorkflowShowPageTabIdFromHash('#runs')).toBe('runs');
    expect(getCoreWorkflowShowPageTabIdFromHash('#versions')).toBe('versions');
  });

  it('opens Flow without a hash or with an unknown one', () => {
    expect(getCoreWorkflowShowPageTabIdFromHash('')).toBe('flow');
    expect(getCoreWorkflowShowPageTabIdFromHash('#settings')).toBe('flow');
  });
});
