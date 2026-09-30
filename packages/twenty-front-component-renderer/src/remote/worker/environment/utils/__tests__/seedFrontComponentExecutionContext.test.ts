import { type FrontComponentExecutionContext } from 'twenty-sdk/front-component';

import { FRONT_COMPONENT_CONTEXT_KEY } from 'twenty-sdk/front-component-renderer';

import { getFrontComponentExecutionContext } from '@/remote/worker/environment/utils/getFrontComponentExecutionContext';
import { seedFrontComponentExecutionContext } from '@/remote/worker/environment/utils/seedFrontComponentExecutionContext';
import { setFrontComponentExecutionContext } from '@/remote/worker/environment/utils/setFrontComponentExecutionContext';

const createExecutionContext = (
  overrides: Partial<FrontComponentExecutionContext> = {},
): FrontComponentExecutionContext => ({
  frontComponentId: 'front-component-id',
  userId: null,
  recordId: null,
  selectedRecordIds: [],
  timelineActivityId: null,
  colorScheme: 'light',
  ...overrides,
});

describe('seedFrontComponentExecutionContext', () => {
  beforeEach(() => {
    delete (globalThis as Record<string, unknown>)[FRONT_COMPONENT_CONTEXT_KEY];
  });

  it('should set the context when the worker has none yet', () => {
    const context = createExecutionContext();

    seedFrontComponentExecutionContext(context);

    expect(getFrontComponentExecutionContext()).toBe(context);
  });

  it('should keep a context the host already pushed through updateContext', () => {
    const pushedContext = createExecutionContext({ colorScheme: 'dark' });
    const staleMountContext = createExecutionContext({ colorScheme: 'light' });

    setFrontComponentExecutionContext(pushedContext);
    seedFrontComponentExecutionContext(staleMountContext);

    expect(getFrontComponentExecutionContext()).toBe(pushedContext);
  });
});
