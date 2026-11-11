import { renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { useTabListActiveTabId } from '@/ui/layout/tab-list/hooks/useTabListActiveTabId';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';

const INSTANCE_ID = 'tab-list-instance';

const renderActiveTabId = ({
  hash = '',
  storedTabId,
  visibleTabIds = ['overview', 'flow', 'runs'],
  defaultTabId,
  behaveAsLinks,
}: {
  hash?: string;
  storedTabId?: string;
  visibleTabIds?: string[];
  defaultTabId?: string;
  behaveAsLinks?: boolean;
}) => {
  const store = createStore();

  if (storedTabId !== undefined) {
    store.set(
      activeTabIdComponentState.atomFamily({ instanceId: INSTANCE_ID }),
      storedTabId,
    );
  }

  const wrapper = ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>
      <MemoryRouter initialEntries={[`/workflow/id${hash}`]}>
        {children}
      </MemoryRouter>
    </JotaiProvider>
  );

  return renderHook(
    () =>
      useTabListActiveTabId({
        componentInstanceId: INSTANCE_ID,
        visibleTabIds,
        defaultTabId,
        behaveAsLinks,
      }),
    { wrapper },
  ).result.current;
};

describe('useTabListActiveTabId', () => {
  it('follows the hash when it names a visible tab', () => {
    expect(
      renderActiveTabId({
        hash: '#runs',
        storedTabId: 'flow',
        defaultTabId: 'overview',
      }),
    ).toBe('runs');
  });

  it('ignores a hash naming a hidden tab', () => {
    expect(
      renderActiveTabId({
        hash: '#runs',
        visibleTabIds: ['flow'],
        defaultTabId: 'flow',
      }),
    ).toBe('flow');
  });

  it('keeps the stored tab over the default', () => {
    expect(
      renderActiveTabId({ storedTabId: 'runs', defaultTabId: 'overview' }),
    ).toBe('runs');
  });

  it('falls back to the default, then the first visible tab', () => {
    expect(renderActiveTabId({ defaultTabId: 'flow' })).toBe('flow');
    expect(
      renderActiveTabId({ storedTabId: 'gone', defaultTabId: 'hidden' }),
    ).toBe('overview');
  });

  it('ignores the hash when tabs are not links', () => {
    expect(
      renderActiveTabId({
        hash: '#runs',
        defaultTabId: 'overview',
        behaveAsLinks: false,
      }),
    ).toBe('overview');
  });

  it('returns null without visible tabs', () => {
    expect(renderActiveTabId({ visibleTabIds: [] })).toBeNull();
  });
});
