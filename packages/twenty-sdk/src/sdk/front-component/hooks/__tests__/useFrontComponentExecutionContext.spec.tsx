import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';

import { FRONT_COMPONENT_CONTEXT_KEY } from '@/sdk/front-component/constants/front-component-context-key';
import { FRONT_COMPONENT_LISTENERS_KEY } from '@/sdk/front-component/constants/front-component-listeners-key';
import {
  subscribeToFrontComponentExecutionContext,
  unsubscribeFromFrontComponentExecutionContext,
} from '@/sdk/front-component/context/frontComponentContext';
import { useFrontComponentExecutionContext } from '@/sdk/front-component/hooks/useFrontComponentExecutionContext';
import { type FrontComponentExecutionContext } from '@/sdk/front-component/types/FrontComponentExecutionContext';

const BASE_CONTEXT: FrontComponentExecutionContext = {
  frontComponentId: 'front-component-id',
  userId: 'user-id',
  recordId: 'rec_123',
  selectedRecordIds: ['rec_123', 'rec_456'],
  timelineActivityId: null,
  colorScheme: 'light',
};

const setExecutionContext = (context: FrontComponentExecutionContext): void => {
  (globalThis as Record<string, unknown>)[FRONT_COMPONENT_CONTEXT_KEY] =
    context;
  const listeners = (globalThis as Record<string, unknown>)[
    FRONT_COMPONENT_LISTENERS_KEY
  ] as Set<() => void> | undefined;

  listeners?.forEach((listener) => listener());
};

afterEach(() => {
  delete (globalThis as Record<string, unknown>)[FRONT_COMPONENT_CONTEXT_KEY];
  delete (globalThis as Record<string, unknown>)[FRONT_COMPONENT_LISTENERS_KEY];
});

describe('useFrontComponentExecutionContext', () => {
  it('returns selected primitive value correctly', () => {
    setExecutionContext(BASE_CONTEXT);

    let observedRecordId: string | null = null;
    const TestComponent = () => {
      observedRecordId = useFrontComponentExecutionContext(
        (ctx) => ctx.recordId,
      );
      return null;
    };

    renderToStaticMarkup(<TestComponent />);
    expect(observedRecordId).toBe('rec_123');
  });

  it('stabilizes object literal selectors without triggering infinite render cycles', () => {
    setExecutionContext(BASE_CONTEXT);

    let observedSelection: {
      recordId: string | null;
      selectedRecordIds: string[];
    } | null = null;
    const TestComponent = () => {
      observedSelection = useFrontComponentExecutionContext((ctx) => ({
        recordId: ctx.recordId,
        selectedRecordIds: ctx.selectedRecordIds,
      }));
      return null;
    };

    renderToStaticMarkup(<TestComponent />);
    expect(observedSelection).toEqual({
      recordId: 'rec_123',
      selectedRecordIds: ['rec_123', 'rec_456'],
    });
  });

  it('updates selected value when external context changes', () => {
    setExecutionContext(BASE_CONTEXT);

    let observedRecordId: string | null = null;
    const TestComponent = () => {
      observedRecordId = useFrontComponentExecutionContext(
        (ctx) => ctx.recordId,
      );
      return null;
    };

    renderToStaticMarkup(<TestComponent />);
    expect(observedRecordId).toBe('rec_123');

    setExecutionContext({ ...BASE_CONTEXT, recordId: 'rec_999' });
    renderToStaticMarkup(<TestComponent />);
    expect(observedRecordId).toBe('rec_999');
  });

  it('subscribes to context changes and handles listener notifications', () => {
    setExecutionContext(BASE_CONTEXT);

    let listenerCallCount = 0;
    const mockListener = () => {
      listenerCallCount++;
    };

    subscribeToFrontComponentExecutionContext(mockListener);
    setExecutionContext({ ...BASE_CONTEXT, recordId: 'rec_456' });

    expect(listenerCallCount).toBe(1);

    unsubscribeFromFrontComponentExecutionContext(mockListener);
    setExecutionContext({ ...BASE_CONTEXT, recordId: 'rec_789' });

    expect(listenerCallCount).toBe(1);
  });
});
