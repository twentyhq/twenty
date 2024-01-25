import { createContext } from 'react';
import { renderHook } from '@testing-library/react';

import { useScopeInternalContextOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useScopeInternalContextOrThrow';
import { ScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/types/ScopeInternalContext';

const mockedContextValue = 'mocked-scope-id';
const MockedContext = createContext<string | null>(mockedContextValue);
const nullContext = createContext<string | null>(null);

const ERROR_MESSAGE =
  'Using a scope context without a ScopeInternalContext.Provider wrapper for context';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MockedContext.Provider value={mockedContextValue}>
    {children}
  </MockedContext.Provider>
);

describe('useScopeInternalContextOrThrow', () => {
  it('should work as expected', () => {
    const { result } = renderHook(
      () =>
        useScopeInternalContextOrThrow(
          MockedContext as ScopeInternalContext<{ scopeId: string }>,
        ),
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current).toBe(mockedContextValue);
  });

  it('should throw an error when used outside of the specified context', () => {
    expect(() => {
      renderHook(() =>
        useScopeInternalContextOrThrow(
          nullContext as ScopeInternalContext<{ scopeId: string }>,
        ),
      );
    }).toThrow(ERROR_MESSAGE);
  });
});
