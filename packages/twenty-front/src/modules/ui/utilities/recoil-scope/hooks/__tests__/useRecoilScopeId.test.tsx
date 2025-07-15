import { renderHook } from '@testing-library/react';
import { createContext } from 'react';

import { useRecoilScopeId } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopeId';

const mockedContextValue = 'mocked-scope-id';
const MockedContext = createContext<string | null>(mockedContextValue);
const nullContext = createContext<string | null>(null);

const ERROR_MESSAGE =
  'Using useRecoilScopeId outside of the specified context : undefined, verify that you are using a RecoilScope with the specific context you want to use.';

describe('useRecoilScopeId', () => {
  it('Should return the scoped ID when used within the specified context', () => {
    const { result } = renderHook(() => useRecoilScopeId(MockedContext), {
      wrapper: ({ children }) => (
        <MockedContext.Provider value={mockedContextValue}>
          {children}
        </MockedContext.Provider>
      ),
    });

    const scopeId = result.current;
    expect(scopeId).toBe(mockedContextValue);
  });

  it('Should throw an error when used outside of the specified context', () => {
    // Suppress console errors for this test since we're expecting an error
    /* eslint-disable no-console */
    const originalConsoleError = console.error;
    console.error = jest.fn();
    /* eslint-enable no-console */

    expect(() => {
      renderHook(() => useRecoilScopeId(nullContext));
    }).toThrow(ERROR_MESSAGE);

    // Restore console.error
    /* eslint-disable no-console */
    console.error = originalConsoleError;
    /* eslint-enable no-console */
  });
});
