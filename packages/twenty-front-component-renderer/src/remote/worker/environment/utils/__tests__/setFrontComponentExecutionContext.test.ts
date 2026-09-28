import { type FrontComponentExecutionContext } from 'twenty-sdk/front-component';
import {
  FRONT_COMPONENT_CONTEXT_KEY,
  FRONT_COMPONENT_LISTENERS_KEY,
} from 'twenty-sdk/front-component-renderer';

import { setFrontComponentExecutionContext } from '../setFrontComponentExecutionContext';

const EXECUTION_CONTEXT: FrontComponentExecutionContext = {
  frontComponentId: 'front-component-id',
  userId: 'user-id',
  recordId: null,
  selectedRecordIds: ['record-1', 'record-2'],
  selectedObjectMetadata: {
    id: 'company-object-id',
    nameSingular: 'company',
    namePlural: 'companies',
  },
  timelineActivityId: null,
  colorScheme: 'light',
};

const cloneExecutionContext = (
  executionContext: FrontComponentExecutionContext,
): FrontComponentExecutionContext =>
  JSON.parse(JSON.stringify(executionContext));

const getStoredExecutionContext = () =>
  (globalThis as Record<string, unknown>)[
    FRONT_COMPONENT_CONTEXT_KEY
  ] as FrontComponentExecutionContext;

describe('setFrontComponentExecutionContext', () => {
  afterEach(() => {
    delete (globalThis as Record<string, unknown>)[FRONT_COMPONENT_CONTEXT_KEY];
    delete (globalThis as Record<string, unknown>)[
      FRONT_COMPONENT_LISTENERS_KEY
    ];
  });

  it('should keep the previous value of fields the host sent again unchanged', () => {
    setFrontComponentExecutionContext(cloneExecutionContext(EXECUTION_CONTEXT));

    const previousExecutionContext = getStoredExecutionContext();

    setFrontComponentExecutionContext(
      cloneExecutionContext({ ...EXECUTION_CONTEXT, colorScheme: 'dark' }),
    );

    const executionContext = getStoredExecutionContext();

    expect(executionContext.colorScheme).toBe('dark');
    expect(executionContext.selectedObjectMetadata).toBe(
      previousExecutionContext.selectedObjectMetadata,
    );
    expect(executionContext.selectedRecordIds).toBe(
      previousExecutionContext.selectedRecordIds,
    );
  });

  it('should replace fields whose value changed', () => {
    setFrontComponentExecutionContext(cloneExecutionContext(EXECUTION_CONTEXT));

    setFrontComponentExecutionContext(
      cloneExecutionContext({
        ...EXECUTION_CONTEXT,
        selectedRecordIds: [],
        selectedObjectMetadata: null,
      }),
    );

    const executionContext = getStoredExecutionContext();

    expect(executionContext.selectedRecordIds).toEqual([]);
    expect(executionContext.selectedObjectMetadata).toBeNull();
  });

  it('should notify listeners once the new context is stored', () => {
    const observedColorSchemes: string[] = [];

    (globalThis as Record<string, unknown>)[FRONT_COMPONENT_LISTENERS_KEY] =
      new Set([
        () =>
          observedColorSchemes.push(getStoredExecutionContext().colorScheme),
      ]);

    setFrontComponentExecutionContext(
      cloneExecutionContext({ ...EXECUTION_CONTEXT, colorScheme: 'dark' }),
    );

    expect(observedColorSchemes).toEqual(['dark']);
  });
});
