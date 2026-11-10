import { getCoreWorkflowShowPageTabIdFromHash } from '@/object-core/workflows/utils/getCoreWorkflowShowPageTabIdFromHash';

describe('getCoreWorkflowShowPageTabIdFromHash', () => {
  it('selects the tab named in the hash', () => {
    expect(
      getCoreWorkflowShowPageTabIdFromHash({
        hash: '#runs',
        defaultTabId: 'flow',
      }),
    ).toBe('runs');
    expect(
      getCoreWorkflowShowPageTabIdFromHash({
        hash: '#overview',
        defaultTabId: 'flow',
      }),
    ).toBe('overview');
  });

  it('opens the default tab without a hash or with an unknown one', () => {
    expect(
      getCoreWorkflowShowPageTabIdFromHash({ hash: '', defaultTabId: 'flow' }),
    ).toBe('flow');
    expect(
      getCoreWorkflowShowPageTabIdFromHash({
        hash: '#settings',
        defaultTabId: 'overview',
      }),
    ).toBe('overview');
  });
});
