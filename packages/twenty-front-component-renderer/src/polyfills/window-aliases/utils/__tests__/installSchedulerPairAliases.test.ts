import { installSchedulerPairAliases } from '../installSchedulerPairAliases';

const REQUEST_FUNCTION_NAME = 'requestScheduledWork';
const CANCEL_FUNCTION_NAME = 'cancelScheduledWork';

const createFallbackSchedulerPair = () => ({
  request: jest.fn().mockReturnValue(11),
  cancel: jest.fn(),
});

const installPair = (
  globalScope: Record<string, unknown>,
  createPair = createFallbackSchedulerPair,
) =>
  installSchedulerPairAliases({
    globalScope,
    requestFunctionName: REQUEST_FUNCTION_NAME,
    cancelFunctionName: CANCEL_FUNCTION_NAME,
    createFallbackSchedulerPair: createPair,
  });

describe('installSchedulerPairAliases', () => {
  it('should alias a native pair onto a distinct window, bound to the global scope', () => {
    const receivedThisValues: unknown[] = [];
    const globalScope: Record<string, unknown> = { window: {} };

    globalScope[REQUEST_FUNCTION_NAME] = function (this: unknown) {
      receivedThisValues.push(this);

      return 7;
    };
    globalScope[CANCEL_FUNCTION_NAME] = jest.fn();

    const nativeRequest = globalScope[REQUEST_FUNCTION_NAME];

    installPair(globalScope);

    const polyfillWindow = globalScope.window as Record<string, unknown>;

    expect(globalScope[REQUEST_FUNCTION_NAME]).toBe(nativeRequest);
    expect((polyfillWindow[REQUEST_FUNCTION_NAME] as () => number)()).toBe(7);
    expect(receivedThisValues).toEqual([globalScope]);
  });

  it('should install one fallback pair on every target when no native pair exists', () => {
    const polyfillWindow: Record<string, unknown> = {};
    const globalScope: Record<string, unknown> = { window: polyfillWindow };

    installPair(globalScope);

    expect(globalScope[REQUEST_FUNCTION_NAME]).toBe(
      polyfillWindow[REQUEST_FUNCTION_NAME],
    );
    expect(globalScope[CANCEL_FUNCTION_NAME]).toBe(
      polyfillWindow[CANCEL_FUNCTION_NAME],
    );
  });

  it('should keep a native function whose counterpart is missing', () => {
    const nativeRequest = jest.fn();
    const polyfillWindow: Record<string, unknown> = {};
    const globalScope: Record<string, unknown> = { window: polyfillWindow };

    globalScope[REQUEST_FUNCTION_NAME] = nativeRequest;

    installPair(globalScope);

    expect(globalScope[REQUEST_FUNCTION_NAME]).toBe(nativeRequest);
    expect(globalScope[CANCEL_FUNCTION_NAME]).toBeUndefined();
    expect(polyfillWindow[REQUEST_FUNCTION_NAME]).toEqual(expect.any(Function));
    expect(polyfillWindow[CANCEL_FUNCTION_NAME]).toEqual(expect.any(Function));
  });

  it('should not overwrite a target that already holds the whole pair', () => {
    const existingRequest = jest.fn();
    const existingCancel = jest.fn();
    const polyfillWindow: Record<string, unknown> = {
      [REQUEST_FUNCTION_NAME]: existingRequest,
      [CANCEL_FUNCTION_NAME]: existingCancel,
    };
    const globalScope: Record<string, unknown> = { window: polyfillWindow };

    installPair(globalScope);

    expect(polyfillWindow[REQUEST_FUNCTION_NAME]).toBe(existingRequest);
    expect(polyfillWindow[CANCEL_FUNCTION_NAME]).toBe(existingCancel);
  });

  it('should not build a fallback pair when a native pair exists', () => {
    const createPair = jest.fn(createFallbackSchedulerPair);
    const globalScope: Record<string, unknown> = { window: {} };

    globalScope[REQUEST_FUNCTION_NAME] = jest.fn();
    globalScope[CANCEL_FUNCTION_NAME] = jest.fn();

    installPair(globalScope, createPair);

    expect(createPair).not.toHaveBeenCalled();
  });
});
