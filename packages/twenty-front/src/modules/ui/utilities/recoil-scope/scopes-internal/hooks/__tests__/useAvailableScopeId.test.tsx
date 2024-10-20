import { renderHook } from '@testing-library/react';
import React from 'react';

import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { createScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/utils/createScopeInternalContext';

const mockScopeIdFrom = {
  Props: 'scopeIdFromProps',
  Context: 'scopeIdFromContext',
};
const MockedContext = createScopeInternalContext();
const errorMessage = 'Scope id is not provided and cannot be found in context.';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MockedContext.Provider value={{ scopeId: mockScopeIdFrom.Context }}>
    {children}
  </MockedContext.Provider>
);

describe('useAvailableScopeIdOrThrow', () => {
  it('should return scopeIdFromProps if provided', () => {
    const {
      result: {
        current: { availableScopeId },
      },
    } = renderHook(
      () => ({
        availableScopeId: useAvailableScopeIdOrThrow(
          MockedContext,
          mockScopeIdFrom.Props,
        ),
      }),
      { wrapper: Wrapper },
    );

    expect(availableScopeId).toBe(mockScopeIdFrom.Props);
  });

  it('should return scopeIdFromContext if no scopeIdFromProps is present', () => {
    const {
      result: {
        current: { availableScopeId },
      },
    } = renderHook(
      () => ({
        availableScopeId: useAvailableScopeIdOrThrow(MockedContext),
      }),
      { wrapper: Wrapper },
    );

    expect(availableScopeId).toBe(mockScopeIdFrom.Context);
  });

  it('should throw an error if no scopeId is provided and scopeId is undefined in the context', () => {
    global.console.error = jest.fn();

    const renderFunction = () =>
      renderHook(() => ({
        availableScopeId: useAvailableScopeIdOrThrow(MockedContext),
      }));

    expect(renderFunction).toThrow(errorMessage);
  });
});
