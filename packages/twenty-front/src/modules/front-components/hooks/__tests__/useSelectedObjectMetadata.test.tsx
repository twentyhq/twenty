import { act, cleanup, renderHook } from '@testing-library/react';
import {
  type FrontComponentExecutionContext,
  useSelectedObjectMetadata,
} from 'twenty-sdk/front-component';
import {
  FRONT_COMPONENT_CONTEXT_KEY,
  FRONT_COMPONENT_LISTENERS_KEY,
} from 'twenty-sdk/front-component-renderer';

jest.mock(
  require.resolve('uuid', {
    paths: [require.resolve('twenty-sdk/front-component')],
  }),
  () => ({ v4: () => 'generated-id' }),
);

const executionContext: FrontComponentExecutionContext = {
  frontComponentId: 'front-component-id',
  userId: 'user-id',
  recordId: null,
  selectedRecordIds: [],
  timelineActivityId: null,
  colorScheme: 'light',
};

const updateExecutionContext = (context: FrontComponentExecutionContext) => {
  (globalThis as Record<string, unknown>)[FRONT_COMPONENT_CONTEXT_KEY] =
    context;

  const listeners = (globalThis as Record<string, unknown>)[
    FRONT_COMPONENT_LISTENERS_KEY
  ] as Set<() => void> | undefined;

  for (const listener of listeners ?? []) {
    listener();
  }
};

describe('useSelectedObjectMetadata', () => {
  afterEach(() => {
    cleanup();
    delete (globalThis as Record<string, unknown>)[FRONT_COMPONENT_CONTEXT_KEY];
    delete (globalThis as Record<string, unknown>)[
      FRONT_COMPONENT_LISTENERS_KEY
    ];
  });

  it('should return null for hosts that omit object metadata', () => {
    updateExecutionContext(executionContext);

    const { result } = renderHook(() => useSelectedObjectMetadata());

    expect(result.current).toBeNull();
  });

  it('should follow object metadata updates and clear the previous object', () => {
    updateExecutionContext({
      ...executionContext,
      selectedObjectMetadata: {
        id: 'company-object-id',
        nameSingular: 'company',
        namePlural: 'companies',
      },
    });

    const { result } = renderHook(() => useSelectedObjectMetadata());

    expect(result.current).toEqual({
      id: 'company-object-id',
      nameSingular: 'company',
      namePlural: 'companies',
    });

    act(() => {
      updateExecutionContext({
        ...executionContext,
        selectedObjectMetadata: {
          id: 'person-object-id',
          nameSingular: 'person',
          namePlural: 'people',
        },
      });
    });

    expect(result.current).toEqual({
      id: 'person-object-id',
      nameSingular: 'person',
      namePlural: 'people',
    });

    act(() => {
      updateExecutionContext({
        ...executionContext,
        selectedObjectMetadata: null,
      });
    });

    expect(result.current).toBeNull();
  });
});
