import { renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';

import { useCoreAgentShowPageActiveTab } from '@/object-core/agents/hooks/useCoreAgentShowPageActiveTab';

let canReadCoreAgentRuns = true;

jest.mock('@/object-core/agents/hooks/useCanReadCoreAgentRuns', () => ({
  useCanReadCoreAgentRuns: () => canReadCoreAgentRuns,
}));

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: () => true,
}));

const renderActiveTab = ({
  initialHasRuns,
  hash = '',
}: {
  initialHasRuns: boolean | undefined;
  hash?: string;
}) => {
  const store = createStore();

  return renderHook(
    ({ hasRuns }: { hasRuns: boolean | undefined }) =>
      useCoreAgentShowPageActiveTab({ agentId: 'agent-id', hasRuns }),
    {
      initialProps: { hasRuns: initialHasRuns },
      wrapper: ({ children }) => (
        <JotaiProvider store={store}>
          <MemoryRouter initialEntries={[`/agent/agent-id${hash}`]}>
            {children}
          </MemoryRouter>
        </JotaiProvider>
      ),
    },
  );
};

describe('useCoreAgentShowPageActiveTab', () => {
  beforeEach(() => {
    canReadCoreAgentRuns = true;
  });

  it('opens Overview for an agent with runs', () => {
    const { result } = renderActiveTab({ initialHasRuns: true });

    expect(result.current).toBe('overview');
  });

  it('opens Settings for an agent without runs', () => {
    const { result } = renderActiveTab({ initialHasRuns: false });

    expect(result.current).toBe('settings');
  });

  it('stays on Settings when the first run starts from the page', () => {
    const { result, rerender } = renderActiveTab({ initialHasRuns: false });

    rerender({ hasRuns: true });

    expect(result.current).toBe('settings');
  });

  it('follows the hash over the default', () => {
    const { result } = renderActiveTab({
      initialHasRuns: true,
      hash: '#turns',
    });

    expect(result.current).toBe('turns');
  });

  it('opens Settings when runs cannot be read', () => {
    canReadCoreAgentRuns = false;

    const { result } = renderActiveTab({
      initialHasRuns: true,
      hash: '#overview',
    });

    expect(result.current).toBe('settings');
  });
});
