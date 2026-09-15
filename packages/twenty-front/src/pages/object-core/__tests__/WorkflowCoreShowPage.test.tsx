import { render } from '@testing-library/react';

import { WorkflowCoreShowPage } from '~/pages/object-core/WorkflowCoreShowPage';

const mockUseCoreWorkflowShowPageResource = jest.fn();
const mockUseRecordShowPageResource = jest.fn();
const mockShell = jest.fn();

jest.mock(
  '@/object-core/workflows/hooks/useCoreWorkflowShowPageResource',
  () => ({
    useCoreWorkflowShowPageResource: (...args: unknown[]) =>
      mockUseCoreWorkflowShowPageResource(...args),
  }),
);

jest.mock(
  '@/object-record/record-show/hooks/useRecordShowPageResource',
  () => ({
    useRecordShowPageResource: (...args: unknown[]) =>
      mockUseRecordShowPageResource(...args),
  }),
);

jest.mock('@/object-record/record-show/components/RecordShowPageShell', () => ({
  RecordShowPageShell: (props: unknown) => {
    mockShell(props);

    return null;
  },
}));

const CORE_RECORD = { __typename: 'Workflow', id: 'workspace-id' };
const WORKSPACE_RECORD = {
  __typename: 'Workflow',
  id: 'workspace-id',
  deletedAt: '2026-09-14T00:00:00.000Z',
};

const renderPage = () =>
  render(<WorkflowCoreShowPage objectRecordId="workspace-id" />);

describe('WorkflowCoreShowPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the core record and skips the workspace read', () => {
    mockUseCoreWorkflowShowPageResource.mockReturnValue({
      record: CORE_RECORD,
      loading: false,
      error: undefined,
    });
    mockUseRecordShowPageResource.mockReturnValue({
      record: undefined,
      loading: false,
      error: undefined,
    });

    renderPage();

    expect(mockUseRecordShowPageResource).toHaveBeenCalledWith(
      expect.objectContaining({ skip: true }),
    );
    expect(mockShell).toHaveBeenCalledWith(
      expect.objectContaining({ record: CORE_RECORD }),
    );
  });

  it('falls back to the workspace read when core has no row', () => {
    mockUseCoreWorkflowShowPageResource.mockReturnValue({
      record: undefined,
      loading: false,
      error: undefined,
    });
    mockUseRecordShowPageResource.mockReturnValue({
      record: WORKSPACE_RECORD,
      loading: false,
      error: undefined,
    });

    renderPage();

    expect(mockUseRecordShowPageResource).toHaveBeenCalledWith(
      expect.objectContaining({ skip: false }),
    );
    expect(mockShell).toHaveBeenCalledWith(
      expect.objectContaining({ record: WORKSPACE_RECORD }),
    );
  });

  it('surfaces a core error instead of falling back', () => {
    const error = new Error('core unavailable');

    mockUseCoreWorkflowShowPageResource.mockReturnValue({
      record: undefined,
      loading: false,
      error,
    });
    mockUseRecordShowPageResource.mockReturnValue({
      record: WORKSPACE_RECORD,
      loading: false,
      error: undefined,
    });

    renderPage();

    expect(mockUseRecordShowPageResource).toHaveBeenCalledWith(
      expect.objectContaining({ skip: true }),
    );
    expect(mockShell).toHaveBeenCalledWith(expect.objectContaining({ error }));
  });

  it('does not fall back while the core query is loading', () => {
    mockUseCoreWorkflowShowPageResource.mockReturnValue({
      record: undefined,
      loading: true,
      error: undefined,
    });
    mockUseRecordShowPageResource.mockReturnValue({
      record: undefined,
      loading: false,
      error: undefined,
    });

    renderPage();

    expect(mockUseRecordShowPageResource).toHaveBeenCalledWith(
      expect.objectContaining({ skip: true }),
    );
    expect(mockShell).toHaveBeenCalledWith(
      expect.objectContaining({ loading: true }),
    );
  });
});
