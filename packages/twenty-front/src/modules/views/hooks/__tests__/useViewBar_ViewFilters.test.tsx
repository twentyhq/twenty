import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { useViewScopedStates } from '@/views/hooks/internal/useViewScopedStates';
import { useViewBar } from '@/views/hooks/useViewBar';
import { ViewScope } from '@/views/scopes/ViewScope';
import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter
    initialEntries={['/one', '/two', { pathname: '/three' }]}
    initialIndex={1}
  >
    <MockedProvider addTypename={false}>
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

export const filterDefinition: FilterDefinition = {
  fieldMetadataId: '113ea8f8-1908-4c9c-9984-3f23c96b92f5',
  label: 'label',
  iconName: 'iconName',
  type: 'TEXT',
};

export const viewFilter: ViewFilter = {
  id: 'id',
  fieldMetadataId: '113ea8f8-1908-4c9c-9984-3f23c96b92f5',
  operand: ViewFilterOperand.Is,
  value: 'value',
  displayValue: 'displayValue',
  definition: filterDefinition,
};

const currentViewId = '23f5dceb-3482-4e3a-9bb4-2f52f2556be9';

describe('useViewBar > viewFilters', () => {
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
      result.current.viewBar.setAvailableFilterDefinitions([filterDefinition]);

      await result.current.viewBar.loadViewFilters([viewFilter], currentViewId);
      result.current.viewBar.setCurrentViewId(currentViewId);
    });

    expect(result.current.currentViewFilters).toStrictEqual([viewFilter]);
  });

  it('should upsertViewFilter', async () => {
    const { result } = renderHook(() => {
      const viewBar = useViewBar({ viewBarId });

      viewBar.setAvailableFilterDefinitions([filterDefinition]);

      viewBar.loadViewFilters([viewFilter], currentViewId);
      viewBar.setCurrentViewId(currentViewId);

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

      viewBar.loadViewFilters([viewFilter], currentViewId);
      viewBar.setCurrentViewId(currentViewId);

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
      result.current.viewBar.removeViewFilter(filterDefinition.fieldMetadataId);
    });

    expect(result.current.currentViewFilters).toStrictEqual([]);
  });
});
