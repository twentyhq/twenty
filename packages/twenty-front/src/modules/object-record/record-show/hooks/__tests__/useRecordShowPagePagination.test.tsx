import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreRecordShowParentViewComponentState } from '@/context-store/states/contextStoreRecordShowParentViewComponentState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useRecordShowPagePagination } from '@/object-record/record-show/hooks/useRecordShowPagePagination';
import { useQueryVariablesFromParentView } from '@/views/hooks/useQueryVariablesFromParentView';
import { renderHook } from '@testing-library/react';

jest.mock('react-router-dom', () => ({
  useParams: () => ({}),
  useSearchParams: () => [new URLSearchParams()],
}));

jest.mock('~/hooks/useNavigateApp', () => ({
  useNavigateApp: () => jest.fn(),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: jest.fn(),
}));
jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: jest.fn(),
}));
jest.mock('@/views/hooks/useQueryVariablesFromParentView', () => ({
  useQueryVariablesFromParentView: jest.fn(),
}));
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue', () => ({
  useAtomComponentStateValue: jest.fn(),
}));
jest.mock('@/ui/utilities/state/jotai/hooks/useSetAtomState', () => ({
  useSetAtomState: () => jest.fn(),
}));

const mockUseObjectMetadataItem = jest.mocked(useObjectMetadataItem);
const mockUseFindManyRecords = jest.mocked(useFindManyRecords);
const mockUseQueryVariablesFromParentView = jest.mocked(
  useQueryVariablesFromParentView,
);
const mockUseAtomComponentStateValue = jest.mocked(
  require('@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue')
    .useAtomComponentStateValue,
);

describe('useRecordShowPagePagination', () => {
  const widgetObjectMetadataItem = {
    id: 'widget-object-id',
    nameSingular: 'equipment',
    namePlural: 'equipments',
    labelPlural: 'Equipment',
  };

  const dashboardObjectMetadataItem = {
    id: 'dashboard-object-id',
    nameSingular: 'dashboard',
    namePlural: 'dashboards',
    labelPlural: 'Dashboards',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseFindManyRecords.mockReturnValue({
      loading: true,
      records: [],
      totalCount: 0,
    } as ReturnType<typeof useFindManyRecords>);

    mockUseQueryVariablesFromParentView.mockReturnValue({
      filter: { status: { eq: 'OPEN' } },
      orderBy: [{ createdAt: 'AscNullsFirst' }],
      isSoftDeleteFilterActive: false,
    });

    mockUseAtomComponentStateValue.mockImplementation((state) => {
      if (state === contextStoreRecordShowParentViewComponentState) {
        return {
          parentViewComponentId: 'widget-record-index-id',
          parentViewObjectNameSingular: 'equipment',
          parentViewFilterGroups: [],
          parentViewFilters: [],
          parentViewSorts: [],
        };
      }

      return undefined;
    });

    mockUseObjectMetadataItem.mockImplementation(({ objectNameSingular }) => {
      if (objectNameSingular === 'equipment') {
        return { objectMetadataItem: widgetObjectMetadataItem } as ReturnType<
          typeof useObjectMetadataItem
        >;
      }

      return { objectMetadataItem: dashboardObjectMetadataItem } as ReturnType<
        typeof useObjectMetadataItem
      >;
    });
  });

  it('uses the parent view object for pagination queries when opening from a dashboard widget', () => {
    renderHook(() =>
      useRecordShowPagePagination('dashboard', 'equipment-record-id'),
    );

    expect(mockUseObjectMetadataItem).toHaveBeenCalledWith({
      objectNameSingular: 'equipment',
    });

    expect(mockUseQueryVariablesFromParentView).toHaveBeenCalledWith({
      objectMetadataItem: widgetObjectMetadataItem,
    });

    expect(mockUseFindManyRecords).toHaveBeenCalledWith(
      expect.objectContaining({
        objectNameSingular: 'equipment',
        filter: { id: { eq: 'equipment-record-id' } },
      }),
    );

    expect(mockUseAtomComponentStateValue).toHaveBeenCalledWith(
      contextStoreRecordShowParentViewComponentState,
      MAIN_CONTEXT_STORE_INSTANCE_ID,
    );
  });

  it('falls back to the provided object when no parent view context exists', () => {
    mockUseAtomComponentStateValue.mockReturnValue(undefined);

    renderHook(() =>
      useRecordShowPagePagination('equipment', 'equipment-record-id'),
    );

    expect(mockUseObjectMetadataItem).toHaveBeenCalledWith({
      objectNameSingular: 'equipment',
    });

    expect(mockUseFindManyRecords).toHaveBeenCalledWith(
      expect.objectContaining({
        objectNameSingular: 'equipment',
      }),
    );
  });
});
