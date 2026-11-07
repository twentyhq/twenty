import { useResetLocationHash } from '@/ui/navigation/hooks/useResetLocationHash';
import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter initialEntries={['/dashboard/1?period=last-month#tab-2']}>
    {children}
  </MemoryRouter>
);

describe('useResetLocationHash', () => {
  it('should remove the hash and keep the query string', () => {
    const { result } = renderHook(
      () => ({ ...useResetLocationHash(), location: useLocation() }),
      { wrapper: Wrapper },
    );

    act(() => {
      result.current.resetLocationHash();
    });

    expect(result.current.location).toMatchObject({
      pathname: '/dashboard/1',
      search: '?period=last-month',
      hash: '',
    });
  });
});
