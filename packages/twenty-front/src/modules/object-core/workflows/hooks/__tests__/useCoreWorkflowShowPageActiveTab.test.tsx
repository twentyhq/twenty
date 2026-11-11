import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { useCoreWorkflowShowPageActiveTab } from '@/object-core/workflows/hooks/useCoreWorkflowShowPageActiveTab';

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
};

const renderActiveTab = ({
  initialIsPublished,
  hash = '',
}: {
  initialIsPublished: boolean | undefined;
  hash?: string;
}) =>
  renderHook(
    ({ isPublished }: HookProps) =>
      useCoreWorkflowShowPageActiveTab({
        coreWorkflowId: 'workflow-id',
        isPublished,
        isVersionRequested: false,
      }),
    {
      initialProps: { isPublished: initialIsPublished },
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={[`/workflow/workflow-id${hash}`]}>
          {children}
        </MemoryRouter>
      ),
    },
  );

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

    rerender({ isPublished: true });

    expect(result.current).toBe('overview');
  });

  it('stays on Flow when the draft is published from the page', () => {
    const { result, rerender } = renderActiveTab({
      initialIsPublished: false,
    });

    rerender({ isPublished: true });

    expect(result.current).toBe('flow');
  });

  it('follows the hash over the default', () => {
    const { result } = renderActiveTab({
      initialIsPublished: false,
      hash: '#runs',
    });

    expect(result.current).toBe('runs');
  });
});
