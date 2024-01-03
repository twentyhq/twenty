import { act } from 'react-dom/test-utils';
import { MemoryRouter, useSearchParams } from 'react-router-dom';
import { gql } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook, waitFor } from '@testing-library/react';
import { RecoilRoot, useRecoilState, useRecoilValue } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { FieldMetadata } from '@/object-record/field/types/FieldMetadata';
import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { Sort } from '@/object-record/object-sort-dropdown/types/Sort';
import { SortDefinition } from '@/object-record/object-sort-dropdown/types/SortDefinition';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { generateDeleteOneRecordMutation } from '@/object-record/utils/generateDeleteOneRecordMutation';
import { getScopedFamilyStateDeprecated } from '@/ui/utilities/recoil-scope/utils/getScopedFamilyStateDeprecated';
import { getScopedStateDeprecated } from '@/ui/utilities/recoil-scope/utils/getScopedStateDeprecated';
import { useViewScopedStates } from '@/views/hooks/internal/useViewScopedStates';
import { useViewBar } from '@/views/hooks/useViewBar';
import { ViewScopeInternalContext } from '@/views/scopes/scope-internal-context/ViewScopeInternalContext';
import { currentViewFieldsScopedFamilyState } from '@/views/states/currentViewFieldsScopedFamilyState';
import { entityCountInCurrentViewScopedState } from '@/views/states/entityCountInCurrentViewScopedState';
import { viewEditModeScopedState } from '@/views/states/viewEditModeScopedState';
import { viewObjectMetadataIdScopeState } from '@/views/states/viewObjectMetadataIdScopeState';
import { viewTypeScopedState } from '@/views/states/viewTypeScopedState';
import { ViewField } from '@/views/types/ViewField';
import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { ViewSort } from '@/views/types/ViewSort';
import { ViewType } from '@/views/types/ViewType';

import 'cross-fetch/polyfill';

jest.mock('@/object-metadata/hooks/useMapFieldMetadataToGraphQLQuery', () => {
  return {
    useMapFieldMetadataToGraphQLQuery: jest.fn().mockReturnValue(() => '\n'),
  };
});

const mockedUuid = 'mocked-uuid';
jest.mock('uuid');

(uuidv4 as jest.Mock).mockReturnValue(mockedUuid);

const mocks = [
  {
    request: {
      query: generateDeleteOneRecordMutation({
        objectMetadataItem: { nameSingular: 'view' } as ObjectMetadataItem,
      }),
      variables: { idToDelete: mockedUuid },
    },
    result: jest.fn(() => ({
      data: { deleteView: { id: '' } },
    })),
  },
  {
    request: {
      query: gql`
        mutation CreateOneViewField($input: ViewFieldCreateInput!) {
          createViewField(data: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          fieldMetadataId: 'id',
          viewId: 'mocked-uuid',
          isVisible: true,
          size: 1,
          position: 1,
        },
      },
    },
    result: jest.fn(() => ({
      data: { createViewField: { id: '' } },
    })),
  },
];
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter
    initialEntries={['/one', '/two', { pathname: '/three' }]}
    initialIndex={1}
  >
    <MockedProvider mocks={mocks} addTypename={false}>
      <RecoilRoot>
        <ViewScopeInternalContext.Provider
          value={{
            scopeId: 'viewScopeId',
          }}
        >
          {children}
        </ViewScopeInternalContext.Provider>
      </RecoilRoot>
    </MockedProvider>
  </MemoryRouter>
);
const renderHookConfig = {
  wrapper: Wrapper,
};

const viewBarId = 'viewBarTestId';

const fieldsToPersist = [
  {
    fieldMetadataId: 'id',
    label: 'label',
    iconName: 'icon',
    type: 'UUID',
    isVisible: true,
    size: 1,
    position: 1,
    metadata: {
      positon: 0,
      size: 2,
      objectMetadataNameSingular: 'view',
      fieldName: 'view',
    },
  },
] as unknown as ViewField[];

const filterDefinition: FilterDefinition = {
  fieldMetadataId: '113ea8f8-1908-4c9c-9984-3f23c96b92f5',
  label: 'label',
  iconName: 'iconName',
  type: 'TEXT',
};

const viewFilter: ViewFilter = {
  id: 'id',
  fieldMetadataId: '113ea8f8-1908-4c9c-9984-3f23c96b92f5',
  operand: ViewFilterOperand.Is,
  value: 'value',
  displayValue: 'displayValue',
  definition: filterDefinition,
};

const sortDefinition: SortDefinition = {
  fieldMetadataId: '12ecdf87-506f-44a7-98c6-393e5f05b225',
  label: 'label',
  iconName: 'icon',
};

const viewSort: ViewSort = {
  id: '88930a16-685f-493b-a96b-91ca55666bba',
  fieldMetadataId: '12ecdf87-506f-44a7-98c6-393e5f05b225',
  direction: 'asc',
  definition: sortDefinition,
};

describe('useViewBar', () => {
  it('should set and get current view Id', () => {
    const { result } = renderHook(
      () => useViewBar({ viewBarId }),
      renderHookConfig,
    );

    expect(result.current.scopeId).toBe(viewBarId);
    expect(result.current.currentViewId).toBeUndefined();

    act(() => {
      result.current.setCurrentViewId('testId');
    });

    expect(result.current.currentViewId).toBe('testId');
  });

  it('should create view and update url params', async () => {
    const { result } = renderHook(() => {
      const viewBar = useViewBar({ viewBarId });
      const searchParams = useSearchParams();

      return {
        viewBar,
        searchParams,
      };
    }, renderHookConfig);
    await act(async () => {
      await result.current.viewBar.createView('Test View');
    });
    expect(result.current.searchParams[0].get('view')).toBe(mockedUuid);
  });

  it('should delete current view and remove id from params', async () => {
    const { result } = renderHook(
      () => ({
        viewBar: useViewBar({ viewBarId }),
        searchParams: useSearchParams(),
      }),
      renderHookConfig,
    );

    await act(async () => {
      await result.current.viewBar.createView('Test View');
      result.current.viewBar.setCurrentViewId(mockedUuid);
    });
    expect(result.current.searchParams[0].get('view')).toBe(mockedUuid);

    await act(async () => {
      await result.current.viewBar.removeView(mockedUuid);
    });
    expect(result.current.searchParams[0].get('view')).toBeNull();

    const addBookMutationMock = mocks[0].result;
    await waitFor(() => expect(addBookMutationMock).toHaveBeenCalled());
  });

  it('should resetViewBar', async () => {
    const { result } = renderHook(() => {
      const viewBar = useViewBar({ viewBarId });
      const {
        currentViewFiltersState,
        currentViewSortsState,
        viewEditModeState,
      } = useViewScopedStates({
        viewScopeId: viewBarId,
      });
      const currentViewFilters = useRecoilValue(currentViewFiltersState);
      const currentViewSorts = useRecoilValue(currentViewSortsState);
      const viewEditMode = useRecoilValue(viewEditModeState);

      return {
        viewBar,
        currentViewFilters,
        currentViewSorts,
        viewEditMode,
      };
    }, renderHookConfig);

    act(() => {
      result.current.viewBar.resetViewBar();
    });

    expect(result.current.currentViewFilters).toStrictEqual([]);
    expect(result.current.currentViewSorts).toStrictEqual([]);
    expect(result.current.viewEditMode).toBe('none');
  });

  it('should handleViewNameSubmit', async () => {
    const { result } = renderHook(
      () => useViewBar({ viewBarId }),
      renderHookConfig,
    );

    await act(async () => {
      await result.current.handleViewNameSubmit('New View Name');
    });
  });

  it('should update edit mode', async () => {
    const { result } = renderHook(
      () => ({
        viewBar: useViewBar({ viewBarId }),
        editMode: useRecoilState(
          getScopedStateDeprecated(viewEditModeScopedState, viewBarId),
        )[0],
      }),
      renderHookConfig,
    );

    expect(result.current.editMode).toBe('none');
    await act(async () => {
      result.current.viewBar.setViewEditMode('create');
    });

    expect(result.current.editMode).toBe('create');
    await act(async () => {
      result.current.viewBar.setViewEditMode('edit');
    });

    expect(result.current.editMode).toBe('edit');
  });

  it('should update url param', async () => {
    const { result } = renderHook(
      () => ({
        viewBar: useViewBar({ viewBarId }),
        searchParams: useSearchParams(),
      }),
      renderHookConfig,
    );
    expect(result.current.searchParams[0].get('view')).toBeNull();
    await act(async () => {
      result.current.viewBar.changeViewInUrl('view1');
    });
    expect(result.current.searchParams[0].get('view')).toBe('view1');
  });

  it('should update object metadata id', async () => {
    const { result } = renderHook(
      () => ({
        viewBar: useViewBar({ viewBarId }),
        metadataId: useRecoilState(
          getScopedStateDeprecated(viewObjectMetadataIdScopeState, viewBarId),
        )[0],
      }),
      renderHookConfig,
    );

    expect(result.current.metadataId).toBeUndefined();
    await act(async () => {
      result.current.viewBar.setViewObjectMetadataId('newId');
    });

    expect(result.current.metadataId).toBe('newId');
  });

  it('should update view type', async () => {
    const { result } = renderHook(
      () => ({
        viewBar: useViewBar({ viewBarId }),
        ViewType: useRecoilState(
          getScopedStateDeprecated(viewTypeScopedState, viewBarId),
        )[0],
      }),
      renderHookConfig,
    );

    expect(result.current.ViewType).toBe('table');
    await act(async () => {
      result.current.viewBar.setViewType(ViewType.Kanban);
    });

    expect(result.current.ViewType).toBe('kanban');
  });

  it('should update count in current view', async () => {
    const { result } = renderHook(
      () => ({
        viewBar: useViewBar({ viewBarId }),
        count: useRecoilState(
          getScopedStateDeprecated(
            entityCountInCurrentViewScopedState,
            viewBarId,
          ),
        )[0],
      }),
      renderHookConfig,
    );

    expect(result.current.count).toBe(0);
    await act(async () => {
      result.current.viewBar.setEntityCountInCurrentView(1);
    });

    expect(result.current.count).toBe(1);
  });

  it('should update current fields', async () => {
    const { result } = renderHook(
      () => ({
        viewBar: useViewBar({ viewBarId }),
        currentFields: useRecoilState(
          getScopedFamilyStateDeprecated(
            currentViewFieldsScopedFamilyState,
            viewBarId,
            mockedUuid,
          ),
        )[0],
      }),
      renderHookConfig,
    );

    expect(result.current.currentFields).toStrictEqual([]);
    await act(async () => {
      result.current.viewBar.setCurrentViewId(mockedUuid);
      result.current.viewBar.setViewObjectMetadataId('newId');
      result.current.viewBar.persistViewFields(fieldsToPersist);
    });

    await waitFor(() =>
      expect(result.current.currentFields).toBe(fieldsToPersist),
    );
  });

  it('should persist view fields', async () => {
    const { result } = renderHook(
      () => useViewBar({ viewBarId }),
      renderHookConfig,
    );

    await act(async () => {
      result.current.setCurrentViewId(mockedUuid);
      result.current.setViewObjectMetadataId('newId');
      await result.current.persistViewFields(fieldsToPersist);
    });

    const persistViewFieldsMutation = mocks[1];

    await waitFor(() =>
      expect(persistViewFieldsMutation.result).toHaveBeenCalled(),
    );
  });

  describe('viewFilters', () => {
    it('should load view filters', async () => {
      const { result } = renderHook(() => {
        const viewBar = useViewBar({ viewBarId });

        const { currentViewFiltersState } = useViewScopedStates({
          viewScopeId: viewBarId,
        });
        const currentViewFilters = useRecoilValue(currentViewFiltersState);

        return {
          viewBar,
          currentViewFilters,
        };
      }, renderHookConfig);

      expect(result.current.currentViewFilters).toStrictEqual([]);

      await act(async () => {
        result.current.viewBar.setAvailableFilterDefinitions([
          filterDefinition,
        ]);

        await result.current.viewBar.loadViewFilters(
          {
            edges: [
              {
                node: viewFilter,
                cursor: '',
              },
            ],
            pageInfo: { hasNextPage: false, startCursor: '', endCursor: '' },
          },
          mockedUuid,
        );
        result.current.viewBar.setCurrentViewId(mockedUuid);
      });

      expect(result.current.currentViewFilters).toStrictEqual([viewFilter]);
    });

    it('should upsertViewFilter', async () => {
      const { result } = renderHook(() => {
        const viewBar = useViewBar({ viewBarId });

        viewBar.setAvailableFilterDefinitions([filterDefinition]);

        viewBar.loadViewFilters(
          {
            edges: [
              {
                node: viewFilter,
                cursor: '',
              },
            ],
            pageInfo: { hasNextPage: false, startCursor: '', endCursor: '' },
          },
          mockedUuid,
        );
        viewBar.setCurrentViewId(mockedUuid);

        const { currentViewFiltersState } = useViewScopedStates({
          viewScopeId: viewBarId,
        });
        const currentViewFilters = useRecoilValue(currentViewFiltersState);

        return {
          viewBar,
          currentViewFilters,
        };
      }, renderHookConfig);

      expect(result.current.currentViewFilters).toStrictEqual([viewFilter]);

      const newFilters: Filter[] = [
        {
          fieldMetadataId: '113ea8f8-1908-4c9c-9984-3f23c96b92f5',
          value: 'value',
          displayValue: 'displayValue',
          operand: ViewFilterOperand.IsNot,
          definition: {
            fieldMetadataId: 'id',
            label: 'label',
            iconName: 'icon',
            type: 'TEXT',
          },
        },
        {
          fieldMetadataId: 'd9487757-183e-4fa0-a554-a980850cb23d',
          value: 'value',
          displayValue: 'displayValue',
          operand: ViewFilterOperand.Contains,
          definition: {
            fieldMetadataId: 'id',
            label: 'label',
            iconName: 'icon',
            type: 'TEXT',
          },
        },
      ];

      // upsert an existing filter
      act(() => {
        result.current.viewBar.upsertViewFilter(newFilters[0]);
      });

      expect(result.current.currentViewFilters).toStrictEqual([
        { ...newFilters[0], id: viewFilter.id },
      ]);

      // upsert a new filter
      act(() => {
        result.current.viewBar.upsertViewFilter(newFilters[1]);
      });

      // expect currentViewFilters to contain both filters
      expect(result.current.currentViewFilters).toStrictEqual([
        { ...newFilters[0], id: viewFilter.id },
        { ...newFilters[1], id: undefined },
      ]);
    });

    it('should remove view filter', () => {
      const { result } = renderHook(() => {
        const viewBar = useViewBar({ viewBarId });

        viewBar.setAvailableFilterDefinitions([filterDefinition]);

        viewBar.loadViewFilters(
          {
            edges: [
              {
                node: viewFilter,
                cursor: '',
              },
            ],
            pageInfo: { hasNextPage: false, startCursor: '', endCursor: '' },
          },
          mockedUuid,
        );
        viewBar.setCurrentViewId(mockedUuid);

        const { currentViewFiltersState } = useViewScopedStates({
          viewScopeId: viewBarId,
        });
        const currentViewFilters = useRecoilValue(currentViewFiltersState);

        return {
          viewBar,
          currentViewFilters,
        };
      }, renderHookConfig);

      expect(result.current.currentViewFilters).toStrictEqual([viewFilter]);

      // remove an existing filter
      act(() => {
        result.current.viewBar.removeViewFilter(
          filterDefinition.fieldMetadataId,
        );
      });

      expect(result.current.currentViewFilters).toStrictEqual([]);
    });
  });

  describe('View Sorts', () => {
    const currentViewId = 'ac8807fd-0065-436d-bdf6-94333d75af6e';

    it('should load view sorts', async () => {
      const { result } = renderHook(() => {
        const viewBar = useViewBar({ viewBarId });

        const { currentViewSortsState } = useViewScopedStates({
          viewScopeId: viewBarId,
        });
        const currentViewSorts = useRecoilValue(currentViewSortsState);

        return {
          viewBar,
          currentViewSorts,
        };
      }, renderHookConfig);

      expect(result.current.currentViewSorts).toStrictEqual([]);

      await act(async () => {
        result.current.viewBar.setAvailableSortDefinitions([sortDefinition]);

        await result.current.viewBar.loadViewSorts(
          {
            edges: [
              {
                node: viewSort,
                cursor: '',
              },
            ],
            pageInfo: { hasNextPage: false, startCursor: '', endCursor: '' },
          },
          currentViewId,
        );
        result.current.viewBar.setCurrentViewId(currentViewId);
      });

      expect(result.current.currentViewSorts).toStrictEqual([viewSort]);
    });

    it('should upsertViewSort', async () => {
      const { result } = renderHook(() => {
        const viewBar = useViewBar({ viewBarId });

        viewBar.setAvailableSortDefinitions([sortDefinition]);

        viewBar.loadViewSorts(
          {
            edges: [
              {
                node: viewSort,
                cursor: '',
              },
            ],
            pageInfo: { hasNextPage: false, startCursor: '', endCursor: '' },
          },
          mockedUuid,
        );
        viewBar.setCurrentViewId(mockedUuid);

        const { currentViewSortsState } = useViewScopedStates({
          viewScopeId: viewBarId,
        });
        const currentViewSorts = useRecoilValue(currentViewSortsState);

        return {
          viewBar,
          currentViewSorts,
        };
      }, renderHookConfig);

      expect(result.current.currentViewSorts).toStrictEqual([viewSort]);

      const newSortFieldMetadataId = 'd9487757-183e-4fa0-a554-a980850cb23d';

      const newSorts: Sort[] = [
        {
          fieldMetadataId: viewSort.fieldMetadataId,
          direction: 'desc',
          definition: sortDefinition,
        },
        {
          fieldMetadataId: newSortFieldMetadataId,
          direction: 'asc',
          definition: {
            ...sortDefinition,
            fieldMetadataId: newSortFieldMetadataId,
          },
        },
      ];

      // upsert an existing sort
      act(() => {
        result.current.viewBar.upsertViewSort(newSorts[0]);
      });

      expect(result.current.currentViewSorts).toStrictEqual([
        { ...newSorts[0], id: viewSort.id },
      ]);

      // upsert a new sort
      act(() => {
        result.current.viewBar.upsertViewSort(newSorts[1]);
      });

      // expect currentViewSorts to contain both sorts
      expect(result.current.currentViewSorts).toStrictEqual([
        { ...newSorts[0], id: viewSort.id },
        { ...newSorts[1], id: undefined },
      ]);
    });

    it('should remove view sort', () => {
      const { result } = renderHook(() => {
        const viewBar = useViewBar({ viewBarId });

        viewBar.setAvailableSortDefinitions([sortDefinition]);

        viewBar.loadViewSorts(
          {
            edges: [
              {
                node: viewSort,
                cursor: '',
              },
            ],
            pageInfo: { hasNextPage: false, startCursor: '', endCursor: '' },
          },
          mockedUuid,
        );
        viewBar.setCurrentViewId(mockedUuid);

        const { currentViewSortsState } = useViewScopedStates({
          viewScopeId: viewBarId,
        });
        const currentViewSorts = useRecoilValue(currentViewSortsState);

        return {
          viewBar,
          currentViewSorts,
        };
      }, renderHookConfig);

      expect(result.current.currentViewSorts).toStrictEqual([viewSort]);

      // remove an existing sort
      act(() => {
        result.current.viewBar.removeViewSort(sortDefinition.fieldMetadataId);
      });

      expect(result.current.currentViewSorts).toStrictEqual([]);
    });
  });

  it('should load view fields', async () => {
    const fieldDefinition: ColumnDefinition<FieldMetadata> = {
      size: 100,
      position: 1,
      fieldMetadataId: '12ecdf87-506f-44a7-98c6-393e5f05b225',
      label: 'label',
      iconName: 'icon',
      type: 'TEXT',
      metadata: {
        placeHolder: 'placeHolder',
        fieldName: 'fieldName',
      },
    };
    const viewField: ViewField = {
      id: '88930a16-685f-493b-a96b-91ca55666bba',
      fieldMetadataId: '12ecdf87-506f-44a7-98c6-393e5f05b225',
      position: 1,
      isVisible: true,
      size: 100,
      definition: fieldDefinition,
    };
    const currentViewId = 'ac8807fd-0065-436d-bdf6-94333d75af6e';

    const { result } = renderHook(() => {
      const viewBar = useViewBar({ viewBarId });

      const { currentViewFieldsState } = useViewScopedStates({
        viewScopeId: viewBarId,
      });
      const currentViewFields = useRecoilValue(currentViewFieldsState);

      return {
        viewBar,
        currentViewFields,
      };
    }, renderHookConfig);

    expect(result.current.currentViewFields).toStrictEqual([]);

    await act(async () => {
      result.current.viewBar.setAvailableFieldDefinitions([fieldDefinition]);

      await result.current.viewBar.loadViewFields(
        {
          edges: [
            {
              node: viewField,
              cursor: '',
            },
          ],
          pageInfo: { hasNextPage: false, startCursor: '', endCursor: '' },
        },
        currentViewId,
      );
      result.current.viewBar.setCurrentViewId(currentViewId);
    });

    expect(result.current.currentViewFields).toStrictEqual([viewField]);
  });

  it('should loadView', async () => {
    const { result } = renderHook(
      () => useViewBar({ viewBarId }),
      renderHookConfig,
    );

    act(() => {
      result.current.loadView(mockedUuid);
    });
  });

  it('should updateCurrentView', async () => {
    const { result } = renderHook(() => {
      const viewBar = useViewBar({ viewBarId });
      viewBar.setCurrentViewId(mockedUuid);

      viewBar.setAvailableSortDefinitions([sortDefinition]);

      viewBar.loadViewSorts(
        {
          edges: [
            {
              node: viewSort,
              cursor: '',
            },
          ],
          pageInfo: { hasNextPage: false, startCursor: '', endCursor: '' },
        },
        mockedUuid,
      );

      viewBar.setAvailableFilterDefinitions([filterDefinition]);

      viewBar.loadViewFilters(
        {
          edges: [
            {
              node: viewFilter,
              cursor: '',
            },
          ],
          pageInfo: { hasNextPage: false, startCursor: '', endCursor: '' },
        },
        mockedUuid,
      );

      return { viewBar };
    }, renderHookConfig);

    await act(async () => {
      await result.current.viewBar.updateCurrentView();
    });
  });
});
