import { createContext } from 'react';
import { renderHook } from '@testing-library/react';
import { atomFamily, RecoilRoot } from 'recoil';

import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

const testScopedState = atomFamily<string | null, string>({
  key: 'testKey',
  default: null,
});

const mockedContextValue = 'mocked-scope-id';
const MockedContext = createContext<string | null>(mockedContextValue);
const nullContext = createContext<string | null>(null);

const ERROR_MESSAGE =
  'Using a scoped atom without a RecoilScope : testKey__"", verify that you are using a RecoilScope with a specific context if you intended to do so.';

describe('useRecoilScopedValue', () => {
  it('Should return the getter and setter for the state and context passed and work properly', async () => {
    const { result } = renderHook(
      () => useRecoilScopedValue(testScopedState, MockedContext),
      {
        wrapper: ({ children }) => (
          <MockedContext.Provider value={mockedContextValue}>
            <RecoilRoot>{children}</RecoilRoot>
          </MockedContext.Provider>
        ),
      },
    );

    const scopedState = result.current;

    expect(scopedState).toBeNull();
  });

  it('Should throw an error when the recoilScopeId is not found by the context', () => {
    expect(() => {
      renderHook(() => useRecoilScopedValue(testScopedState, nullContext));
    }).toThrow(ERROR_MESSAGE);
  });
});
