import { renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';

import { useCoreWorkflowShowPageActiveTab } from '@/object-core/workflows/hooks/useCoreWorkflowShowPageActiveTab';
import { getCoreWorkflowShowPageTabListComponentInstanceId } from '@/object-core/workflows/utils/getCoreWorkflowShowPageTabListComponentInstanceId';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';

jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: () => ({
    objectMetadataItem: { id: 'workflow-run-object-metadata-id' },
  }),
}));

jest.mock('@/object-record/hooks/useObjectPermissionsForObject', () => ({
  useObjectPermissionsForObject: () => ({
    canReadAllRecords: true,
  }),
}));

type HookProps = {
  isPublished: boolean | undefined;
  requestedVersionId: string | null;
};

const renderActiveTab = ({
  initialIsPublished,
  hash = '',
  requestedVersionId = null,
  storedTabId,
}: {
  initialIsPublished: boolean | undefined;
  hash?: string;
  requestedVersionId?: string | null;
  storedTabId?: string;
}) => {
  const store = createStore();

  if (storedTabId !== undefined) {
    store.set(
      activeTabIdComponentState.atomFamily({
        instanceId: getCoreWorkflowShowPageTabListComponentInstanceId({
          coreWorkflowId: 'workflow-id',
          requestedVersionId: null,
        }),
      }),
      storedTabId,
    );
  }

  return renderHook(
    ({ isPublished, requestedVersionId }: HookProps) =>
      useCoreWorkflowShowPageActiveTab({
        coreWorkflowId: 'workflow-id',
        isPublished,
        requestedVersionId,
      }),
    {
      initialProps: { isPublished: initialIsPublished, requestedVersionId },
      wrapper: ({ children }) => (
        <JotaiProvider store={store}>
          <MemoryRouter initialEntries={[`/workflow/workflow-id${hash}`]}>
            {children}
          </MemoryRouter>
        </JotaiProvider>
      ),
    },
  );
};

describe('useCoreWorkflowShowPageActiveTab', () => {
  it('opens Overview for a published workflow', () => {
    const { result } = renderActiveTab({ initialIsPublished: true });

    expect(result.current).toBe('overview');
  });

  it('opens Flow for a draft workflow', () => {
    const { result } = renderActiveTab({ initialIsPublished: false });

    expect(result.current).toBe('flow');
  });

  it('picks the default once the workflow has loaded', () => {
    const { result, rerender } = renderActiveTab({
      initialIsPublished: undefined,
    });

    rerender({ isPublished: true, requestedVersionId: null });

    expect(result.current).toBe('overview');
  });

  it('stays on Flow when the draft is published from the page', () => {
    const { result, rerender } = renderActiveTab({
      initialIsPublished: false,
    });

    rerender({ isPublished: true, requestedVersionId: null });

    expect(result.current).toBe('flow');
  });

  it('follows the hash over the default', () => {
    const { result } = renderActiveTab({
      initialIsPublished: false,
      hash: '#runs',
    });

    expect(result.current).toBe('runs');
  });

  it('reopens the last viewed tab', () => {
    const { result } = renderActiveTab({
      initialIsPublished: true,
      storedTabId: 'runs',
    });

    expect(result.current).toBe('runs');
  });

  it('opens Flow for a requested version even after another tab was viewed', () => {
    const { result } = renderActiveTab({
      initialIsPublished: true,
      storedTabId: 'overview',
      requestedVersionId: 'version-id',
    });

    expect(result.current).toBe('flow');
  });
});
