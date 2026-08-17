import { type FrontComponentExecutionContext } from 'twenty-sdk/front-component';
import {
  FRONT_COMPONENT_CONTEXT_KEY,
  FRONT_COMPONENT_LISTENERS_KEY,
} from 'twenty-sdk/front-component-renderer';

import { setFrontComponentExecutionContext } from '../setFrontComponentExecutionContext';
import { subscribeToFrontComponentColorSchemeUpdates } from '../subscribeToFrontComponentColorSchemeUpdates';

type CreateExecutionContextInput = {
  colorScheme: FrontComponentExecutionContext['colorScheme'];
  selectedRecordIds?: string[];
};

const createExecutionContext = ({
  colorScheme,
  selectedRecordIds = [],
}: CreateExecutionContextInput): FrontComponentExecutionContext => ({
  frontComponentId: 'front-component-id',
  userId: 'user-id',
  recordId: null,
  selectedRecordIds,
  colorScheme,
});

describe('subscribeToFrontComponentColorSchemeUpdates', () => {
  beforeEach(() => {
    delete (globalThis as Record<string, unknown>)[FRONT_COMPONENT_CONTEXT_KEY];
    delete (globalThis as Record<string, unknown>)[
      FRONT_COMPONENT_LISTENERS_KEY
    ];
  });

  it('should not notify on context updates that keep the color scheme', () => {
    const colorSchemeListener = jest.fn();
    subscribeToFrontComponentColorSchemeUpdates(colorSchemeListener);

    setFrontComponentExecutionContext(
      createExecutionContext({ colorScheme: 'light' }),
    );
    setFrontComponentExecutionContext(
      createExecutionContext({
        colorScheme: 'light',
        selectedRecordIds: ['record-id'],
      }),
    );

    expect(colorSchemeListener).not.toHaveBeenCalled();
  });

  it('should notify once per color scheme change', () => {
    const colorSchemeListener = jest.fn();
    subscribeToFrontComponentColorSchemeUpdates(colorSchemeListener);

    setFrontComponentExecutionContext(
      createExecutionContext({ colorScheme: 'dark' }),
    );
    expect(colorSchemeListener).toHaveBeenCalledTimes(1);

    setFrontComponentExecutionContext(
      createExecutionContext({
        colorScheme: 'dark',
        selectedRecordIds: ['record-id'],
      }),
    );
    expect(colorSchemeListener).toHaveBeenCalledTimes(1);

    setFrontComponentExecutionContext(
      createExecutionContext({ colorScheme: 'light' }),
    );
    expect(colorSchemeListener).toHaveBeenCalledTimes(2);
  });

  it('should stop notifying after unsubscribe', () => {
    const colorSchemeListener = jest.fn();
    const unsubscribe =
      subscribeToFrontComponentColorSchemeUpdates(colorSchemeListener);

    unsubscribe();
    setFrontComponentExecutionContext(
      createExecutionContext({ colorScheme: 'dark' }),
    );

    expect(colorSchemeListener).not.toHaveBeenCalled();
  });
});
