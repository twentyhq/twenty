import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

import { useSearchPageQueryParams } from '@/search/hooks/useSearchPageQueryParams';

const renderSearchPageQueryParams = (initialEntry: string) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path={AppPath.Search} element={children} />
      </Routes>
    </MemoryRouter>
  );

  return renderHook(
    () => ({
      queryParams: useSearchPageQueryParams(),
      location: useLocation(),
      navigationType: useNavigationType(),
    }),
    { wrapper },
  );
};

describe('useSearchPageQueryParams', () => {
  it('should read the search input and object filter from the url', () => {
    const { result } = renderSearchPageQueryParams(
      '/search?q=acme&object=company',
    );

    expect(result.current.queryParams.searchInput).toBe('acme');
    expect(result.current.queryParams.objectNameSingular).toBe('company');
  });

  it('should default to an empty search and no object filter', () => {
    const { result } = renderSearchPageQueryParams('/search');

    expect(result.current.queryParams.searchInput).toBe('');
    expect(result.current.queryParams.objectNameSingular).toBeNull();
  });

  it('should write the search input to the url without touching the object filter', () => {
    const { result } = renderSearchPageQueryParams('/search?object=company');

    act(() => {
      result.current.queryParams.setSearchInput('acme');
    });

    expect(result.current.location.search).toBe('?object=company&q=acme');
    expect(result.current.queryParams.searchInput).toBe('acme');
  });

  it('should drop the query param when the search input is cleared', () => {
    const { result } = renderSearchPageQueryParams('/search?q=acme');

    act(() => {
      result.current.queryParams.setSearchInput('');
    });

    expect(result.current.location.search).toBe('');
  });

  it('should drop the query param when the object filter is reset to all objects', () => {
    const { result } = renderSearchPageQueryParams(
      '/search?q=acme&object=company',
    );

    act(() => {
      result.current.queryParams.setObjectNameSingular(null);
    });

    expect(result.current.location.search).toBe('?q=acme');
  });

  it('should replace the history entry so typing does not stack history steps', () => {
    const { result } = renderSearchPageQueryParams('/search');

    act(() => {
      result.current.queryParams.setSearchInput('a');
    });

    expect(result.current.navigationType).toBe('REPLACE');
  });
});
