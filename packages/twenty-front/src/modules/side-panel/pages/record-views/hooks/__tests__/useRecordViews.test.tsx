import { act, renderHook, waitFor } from '@testing-library/react';
import { gql } from '@apollo/client';
import { useRecordViews } from '@/side-panel/pages/record-views/hooks/useRecordViews';
import { type View } from '@/views/types/View';
import { ViewType, ViewVisibility } from '~/generated-metadata/graphql';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const objectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const mockQuery = jest.fn();
const mockClient = { query: mockQuery };
const mockDocument = gql`
  query Test {
    __typename
  }
`;
const mockDependencies = { timeZone: 'Europe/Paris' };
let mockCanRead = true;
const baseView: View = {
  id: 'all',
  name: 'All',
  type: ViewType.TABLE,
  objectMetadataId: objectMetadataItem.id,
  isCompact: false,
  viewFields: [],
  viewGroups: [],
  viewFilters: [],
  viewSorts: [],
  shouldHideEmptyGroups: false,
  position: 0,
  icon: 'IconTable',
  visibility: ViewVisibility.WORKSPACE,
  isActive: true,
};
let mockViews: View[] = [];

jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: () => ({ objectMetadataItem }),
}));
jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => mockClient,
}));
jest.mock('@/object-record/hooks/useFindManyRecordsQuery', () => ({
  useFindManyRecordsQuery: () => ({ findManyRecordsQuery: mockDocument }),
}));
jest.mock('@/object-record/hooks/useObjectPermissionsForObject', () => ({
  useObjectPermissionsForObject: () => ({ canReadObjectRecords: mockCanRead }),
}));
jest.mock(
  '@/object-record/record-filter/hooks/useFilterValueDependencies',
  () => ({
    useFilterValueDependencies: () => ({
      filterValueDependencies: mockDependencies,
    }),
  }),
);
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue',
  () => ({ useAtomFamilySelectorValue: () => mockViews }),
);
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => objectMetadataItem.fields,
}));

const response = (recordId?: string) => ({
  data: { companies: { edges: recordId ? [{ node: { id: recordId } }] : [] } },
});
const renderViews = () =>
  renderHook(
    ({ recordId }) =>
      useRecordViews({ objectNameSingular: 'company', recordId }),
    { initialProps: { recordId: 'record-1' } },
  );

describe('useRecordViews', () => {
  beforeEach(() => {
    mockQuery.mockReset();
    mockCanRead = true;
    mockViews = [baseView, { ...baseView, id: 'filtered' }];
  });

  it('returns only confirmed matches in view order', async () => {
    mockQuery
      .mockResolvedValueOnce(response('record-1'))
      .mockResolvedValueOnce(response());
    const { result } = renderViews();
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.views.map((view) => view.id)).toEqual(['all']);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        fetchPolicy: 'no-cache',
        variables: { filter: { id: { eq: 'record-1' } }, limit: 1 },
      }),
    );
  });

  it('does not query without read permission', async () => {
    mockCanRead = false;
    const { result } = renderViews();
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.views).toEqual([]);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('shows errors separately from an empty result and supports retry', async () => {
    mockQuery.mockRejectedValue(new Error('Network unavailable'));
    const { result } = renderViews();
    await waitFor(() => expect(result.current.error).toBe(true));
    expect(result.current.views).toEqual([]);
    mockQuery.mockResolvedValue(response('record-1'));
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.views).toHaveLength(2));
    expect(result.current.error).toBe(false);
  });

  it('ignores stale responses after the target record changes', async () => {
    let resolveOldRequest: (
      value: ReturnType<typeof response>,
    ) => void = () => {};
    const oldRequest = new Promise<ReturnType<typeof response>>((resolve) => {
      resolveOldRequest = resolve;
    });
    mockQuery.mockReturnValue(oldRequest);
    const { result, rerender } = renderViews();
    mockQuery.mockResolvedValue(response());
    rerender({ recordId: 'record-2' });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      resolveOldRequest(response('record-1'));
    });
    expect(result.current.views).toEqual([]);
  });

  it('limits simultaneous checks for many views', async () => {
    mockViews = Array.from({ length: 12 }, (_, index) => ({
      ...baseView,
      id: `view-${index}`,
    }));
    let release: (value: ReturnType<typeof response>) => void = () => {};
    const pending = new Promise<ReturnType<typeof response>>((resolve) => {
      release = resolve;
    });
    mockQuery.mockReturnValue(pending);
    const { result } = renderViews();
    expect(mockQuery).toHaveBeenCalledTimes(5);
    mockQuery.mockResolvedValue(response('record-1'));
    await act(async () => {
      release(response('record-1'));
    });
    await waitFor(() => expect(result.current.views).toHaveLength(12));
  });
});
