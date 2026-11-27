import { renderHook } from '@testing-library/react';

import { useCoreWorkflowVersionContent } from '@/object-core/workflows/hooks/useCoreWorkflowVersionContent';
import { useCoreWorkflowVersion } from '@/object-core/workflows/versions/hooks/useCoreWorkflowVersion';
import { CoreWorkflowVersionStatus } from '~/generated/graphql';

jest.mock(
  '@/object-core/workflows/versions/hooks/useCoreWorkflowVersion',
  () => ({
    useCoreWorkflowVersion: jest.fn(),
  }),
);

const mockUseCoreWorkflowVersion = jest.mocked(useCoreWorkflowVersion);

type CoreWorkflowVersion = NonNullable<
  ReturnType<typeof useCoreWorkflowVersion>['coreWorkflowVersion']
>;

const buildCoreWorkflowVersion = ({
  id,
  coreWorkflowId,
}: {
  id: string;
  coreWorkflowId: string;
}): CoreWorkflowVersion => ({
  __typename: 'CoreWorkflowVersionDTO',
  id,
  coreWorkflowId,
  label: `Version ${id}`,
  status: CoreWorkflowVersionStatus.DRAFT,
  trigger: null,
  steps: [],
  createdAt: '2026-11-20T00:00:00.000Z',
  updatedAt: '2026-11-20T00:00:00.000Z',
});

const mockVersions = ({
  loaded,
  previous,
}: {
  loaded: CoreWorkflowVersion | null;
  previous: CoreWorkflowVersion | null;
}) => {
  mockUseCoreWorkflowVersion.mockReturnValue({
    coreWorkflowVersion: loaded,
    previousCoreWorkflowVersion: previous,
    loading: false,
    error: undefined,
    refetchCoreWorkflowVersion: jest.fn(),
  });
};

describe('useCoreWorkflowVersionContent', () => {
  it('should return the requested version once loaded', () => {
    mockVersions({
      loaded: buildCoreWorkflowVersion({
        id: 'version-2',
        coreWorkflowId: 'workflow-1',
      }),
      previous: null,
    });

    const { result } = renderHook(() =>
      useCoreWorkflowVersionContent({
        coreWorkflowId: 'workflow-1',
        coreWorkflowVersionId: 'version-2',
      }),
    );

    expect(result.current?.id).toBe('version-2');
    expect(result.current?.workflowId).toBe('workflow-1');
  });

  it('should keep the previous version of the same workflow while the next one loads', () => {
    mockVersions({
      loaded: null,
      previous: buildCoreWorkflowVersion({
        id: 'version-1',
        coreWorkflowId: 'workflow-1',
      }),
    });

    const { result } = renderHook(() =>
      useCoreWorkflowVersionContent({
        coreWorkflowId: 'workflow-1',
        coreWorkflowVersionId: 'version-2',
      }),
    );

    expect(result.current?.id).toBe('version-1');
  });

  it('should not show a previous version that belongs to another workflow', () => {
    mockVersions({
      loaded: null,
      previous: buildCoreWorkflowVersion({
        id: 'version-1',
        coreWorkflowId: 'workflow-other',
      }),
    });

    const { result } = renderHook(() =>
      useCoreWorkflowVersionContent({
        coreWorkflowId: 'workflow-1',
        coreWorkflowVersionId: 'version-2',
      }),
    );

    expect(result.current).toBeUndefined();
  });

  it('should not query a version without its workflow', () => {
    mockVersions({ loaded: null, previous: null });

    renderHook(() =>
      useCoreWorkflowVersionContent({
        coreWorkflowId: undefined,
        coreWorkflowVersionId: 'version-2',
      }),
    );

    expect(mockUseCoreWorkflowVersion).toHaveBeenLastCalledWith(undefined);
  });
});
