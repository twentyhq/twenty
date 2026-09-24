import { useRecordShowPagePagination } from '@/object-record/record-show/hooks/useRecordShowPagePagination';
import { renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { type RecordGqlOperationOrderBy } from 'twenty-shared/types';

const CURRENT_RECORD_CURSOR = 'encoded-cursor';

const ORDER_BY: RecordGqlOperationOrderBy = [{ name: 'AscNullsLast' }];

const mockUseFindManyRecords = jest.fn();

jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: () => ({
    objectMetadataItem: { id: 'person-object', namePlural: 'people' },
  }),
}));

jest.mock('@/views/hooks/useQueryVariablesFromParentView', () => ({
  useQueryVariablesFromParentView: () => ({
    filter: {},
    orderBy: [{ name: 'AscNullsLast' }],
    isSoftDeleteFilterActive: false,
  }),
}));

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: (params: unknown) => mockUseFindManyRecords(params),
}));

jest.mock('@/side-panel/hooks/useSidePanelHistory', () => ({
  useSidePanelHistory: () => ({ navigateSidePanelHistory: jest.fn() }),
}));

jest.mock('@/side-panel/routing/hooks/useOpenRoutedPageInSidePanel', () => ({
  useOpenRoutedPageInSidePanel: () => ({
    openRoutedPageInSidePanel: jest.fn(),
  }),
}));

jest.mock('@/ui/layout/hooks/useWorkspaceSurface', () => ({
  useWorkspaceSurface: () => ({ type: 'page' }),
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useSetAtomComponentState', () => ({
  useSetAtomComponentState: () => jest.fn(),
}));

type FindManyRecordsParams = {
  filter?: { id?: { eq?: string } };
  orderBy?: RecordGqlOperationOrderBy;
  skip?: boolean;
  cursorFilter?: { cursor: string; cursorDirection: 'before' | 'after' };
};

const isCurrentRecordQuery = (params: FindManyRecordsParams) =>
  params.filter?.id?.eq === 'record-1';

const renderPaginationHook = () =>
  renderHook(() => useRecordShowPagePagination('person', 'record-1'), {
    wrapper: ({ children }) => (
      <Provider store={createStore()}>
        <MemoryRouter>{children}</MemoryRouter>
      </Provider>
    ),
  });

const findNeighborCall = (cursorDirection: 'before' | 'after') =>
  mockUseFindManyRecords.mock.calls
    .map(([params]: [FindManyRecordsParams]) => params)
    .find((params) => params.cursorFilter?.cursorDirection === cursorDirection);

describe('useRecordShowPagePagination', () => {
  beforeEach(() => {
    mockUseFindManyRecords.mockReset();
  });

  it('should ask the server for both neighbours with the current record cursor', () => {
    mockUseFindManyRecords.mockImplementation(
      (params: FindManyRecordsParams) => ({
        loading: false,
        records: isCurrentRecordQuery(params)
          ? [{ id: 'record-1', name: 'Ada', deletedAt: null }]
          : [],
        totalCount: 0,
        pageInfo: isCurrentRecordQuery(params)
          ? { endCursor: CURRENT_RECORD_CURSOR }
          : undefined,
      }),
    );

    renderPaginationHook();

    const beforeCall = findNeighborCall('before');
    const afterCall = findNeighborCall('after');

    expect(beforeCall?.cursorFilter?.cursor).toBe(CURRENT_RECORD_CURSOR);
    expect(afterCall?.cursorFilter?.cursor).toBe(CURRENT_RECORD_CURSOR);
    expect(beforeCall?.skip).toBe(false);
    expect(afterCall?.skip).toBe(false);
  });

  it('should scan backward through the cursor direction rather than a reversed ordering', () => {
    mockUseFindManyRecords.mockImplementation(
      (params: FindManyRecordsParams) => ({
        loading: false,
        records: isCurrentRecordQuery(params)
          ? [{ id: 'record-1', name: 'Ada', deletedAt: null }]
          : [],
        totalCount: 0,
        pageInfo: isCurrentRecordQuery(params)
          ? { endCursor: CURRENT_RECORD_CURSOR }
          : undefined,
      }),
    );

    renderPaginationHook();

    expect(findNeighborCall('before')?.orderBy).toEqual(ORDER_BY);
  });

  it('should skip the neighbour queries while the current record cursor is missing', () => {
    mockUseFindManyRecords.mockImplementation(() => ({
      loading: false,
      records: [],
      totalCount: undefined,
      pageInfo: undefined,
    }));

    renderPaginationHook();

    const neighborCalls = mockUseFindManyRecords.mock.calls
      .map(([params]: [FindManyRecordsParams]) => params)
      .filter((params) => !isCurrentRecordQuery(params));

    expect(neighborCalls.length).toBeGreaterThan(0);
    expect(neighborCalls.every((params) => params.skip === true)).toBe(true);
  });
});
