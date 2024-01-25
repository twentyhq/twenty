import { act } from 'react-dom/test-utils';
import { MemoryRouter, useSearchParams } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook, waitFor } from '@testing-library/react';
import { RecoilRoot, useRecoilState, useRecoilValue } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { generateDeleteOneRecordMutation } from '@/object-record/utils/generateDeleteOneRecordMutation';
import { getScopedStateDeprecated } from '@/ui/utilities/recoil-scope/utils/getScopedStateDeprecated';
import {
  filterDefinition,
  viewFilter,
} from '@/views/hooks/__tests__/useViewBar_ViewFilters.test';
import {
  sortDefinition,
  viewSort,
} from '@/views/hooks/__tests__/useViewBar_ViewSorts.test';
import { useViewScopedStates } from '@/views/hooks/internal/useViewScopedStates';
import { useViewBar } from '@/views/hooks/useViewBar';
import { ViewScope } from '@/views/scopes/ViewScope';
import { entityCountInCurrentViewScopedState } from '@/views/states/entityCountInCurrentViewScopedState';
import { viewEditModeScopedState } from '@/views/states/viewEditModeScopedState';
import { viewObjectMetadataIdScopeState } from '@/views/states/viewObjectMetadataIdScopeState';

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
];

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter
    initialEntries={['/one', '/two', { pathname: '/three' }]}
    initialIndex={1}
  >
    <MockedProvider mocks={mocks} addTypename={false}>
      <RecoilRoot>
        <ViewScope viewScopeId="viewScopeId">{children}</ViewScope>
      </RecoilRoot>
    </MockedProvider>
  </MemoryRouter>
);
const renderHookConfig = {
  wrapper: Wrapper,
};

const viewBarId = 'viewBarTestId';

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

      viewBar.loadViewSorts([viewSort], mockedUuid);

      viewBar.setAvailableFilterDefinitions([filterDefinition]);

      viewBar.loadViewFilters([viewFilter], mockedUuid);

      return { viewBar };
    }, renderHookConfig);

    await act(async () => {
      await result.current.viewBar.updateCurrentView();
    });
  });
});
