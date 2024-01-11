import { createContext } from 'react';
import { act, renderHook } from '@testing-library/react';
import { atomFamily, RecoilRoot } from 'recoil';

import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

const testScopedState = atomFamily<string | null, string>({
  key: 'testKey',
  default: null,
});

const mockedContextValue = 'mocked-scope-id';
const MockedContext = createContext<string | null>(mockedContextValue);
const nullContext = createContext<string | null>(null);

const ERROR_MESSAGE =
  'Using a scoped atom without a RecoilScope : testKey__"", verify that you are using a RecoilScope with a specific context if you intended to do so.';

describe('useRecoilScopedState', () => {
  it('Should return the getter and setter for the state and context passed and work properly', async () => {
    const { result } = renderHook(
      () => useRecoilScopedState(testScopedState, MockedContext),
      {
        wrapper: ({ children }) => (
          <MockedContext.Provider value={mockedContextValue}>
            <RecoilRoot>{children}</RecoilRoot>
          </MockedContext.Provider>
        ),
      },
    );

    const [scopedState, setScopedState] = result.current;

    expect(scopedState).toBeNull();

    await act(async () => {
      setScopedState('testValue');
    });

    const [scopedStateAfterSetter] = result.current;

    expect(scopedStateAfterSetter).toEqual('testValue');
  });

  it('Should throw an error when the recoilScopeId is not found by the context', () => {
    expect(() => {
      renderHook(() => useRecoilScopedState(testScopedState, nullContext));
    }).toThrow(ERROR_MESSAGE);
  });
});
