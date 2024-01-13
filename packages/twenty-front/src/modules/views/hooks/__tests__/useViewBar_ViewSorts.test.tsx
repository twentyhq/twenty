import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { Sort } from '@/object-record/object-sort-dropdown/types/Sort';
import { SortDefinition } from '@/object-record/object-sort-dropdown/types/SortDefinition';
import { useViewScopedStates } from '@/views/hooks/internal/useViewScopedStates';
import { useViewBar } from '@/views/hooks/useViewBar';
import { ViewScope } from '@/views/scopes/ViewScope';
import { ViewSort } from '@/views/types/ViewSort';

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

export const sortDefinition: SortDefinition = {
  fieldMetadataId: '12ecdf87-506f-44a7-98c6-393e5f05b225',
  label: 'label',
  iconName: 'icon',
};

export const viewSort: ViewSort = {
  id: '88930a16-685f-493b-a96b-91ca55666bba',
  fieldMetadataId: '12ecdf87-506f-44a7-98c6-393e5f05b225',
  direction: 'asc',
  definition: sortDefinition,
};

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

      await result.current.viewBar.loadViewSorts([viewSort], currentViewId);
      result.current.viewBar.setCurrentViewId(currentViewId);
    });

    expect(result.current.currentViewSorts).toStrictEqual([viewSort]);
  });

  it('should upsertViewSort', async () => {
    const { result } = renderHook(() => {
      const viewBar = useViewBar({ viewBarId });

      viewBar.setAvailableSortDefinitions([sortDefinition]);

      viewBar.loadViewSorts([viewSort], currentViewId);
      viewBar.setCurrentViewId(currentViewId);

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

      viewBar.loadViewSorts([viewSort], currentViewId);
      viewBar.setCurrentViewId(currentViewId);

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
