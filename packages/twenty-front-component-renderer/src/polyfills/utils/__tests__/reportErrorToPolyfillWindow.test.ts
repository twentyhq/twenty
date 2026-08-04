import { Window } from '@remote-dom/polyfill';

import { reportErrorToPolyfillWindow } from '@/polyfills/utils/reportErrorToPolyfillWindow';

type ReportedErrorEvent = {
  message: string;
  error: unknown;
  cancelable: boolean;
  preventDefault: () => void;
};

const createPolyfillWindow = () =>
  new Window() as unknown as Record<string, unknown>;

const listenForErrorEvents = (
  polyfillWindow: Record<string, unknown>,
  onError: (event: ReportedErrorEvent) => void,
) => {
  (
    polyfillWindow.addEventListener as (
      type: string,
      listener: (event: ReportedErrorEvent) => void,
    ) => void
  )('error', onError);
};

describe('reportErrorToPolyfillWindow', () => {
  it('dispatches a cancelable error event carrying the reported value', () => {
    const polyfillWindow = createPolyfillWindow();
    const errorEvents: ReportedErrorEvent[] = [];
    const error = new Error('guest failure');

    listenForErrorEvents(polyfillWindow, (event) => {
      event.preventDefault();
      errorEvents.push(event);
    });

    reportErrorToPolyfillWindow({ polyfillWindow, error });

    expect(errorEvents).toHaveLength(1);
    expect(errorEvents[0].error).toBe(error);
    expect(errorEvents[0].message).toBe('guest failure');
    expect(errorEvents[0].cancelable).toBe(true);
  });

  it('logs when no listener handled the error event', () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const polyfillWindow = createPolyfillWindow();
    const error = new Error('guest failure');

    listenForErrorEvents(polyfillWindow, () => {});

    reportErrorToPolyfillWindow({ polyfillWindow, error });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('was not handled'),
      error,
    );

    consoleErrorSpy.mockRestore();
  });

  it('still returns when a listener throws while handling the error event', () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const polyfillWindow = createPolyfillWindow();
    const error = new Error('guest failure');

    listenForErrorEvents(polyfillWindow, () => {
      throw new Error('listener failure');
    });

    expect(() =>
      reportErrorToPolyfillWindow({ polyfillWindow, error }),
    ).not.toThrow();

    consoleErrorSpy.mockRestore();
  });

  it('reports a value that cannot be converted to a string', () => {
    const polyfillWindow = createPolyfillWindow();
    const errorEvents: ReportedErrorEvent[] = [];
    const error = Object.create(null);

    listenForErrorEvents(polyfillWindow, (event) => {
      event.preventDefault();
      errorEvents.push(event);
    });

    expect(() =>
      reportErrorToPolyfillWindow({ polyfillWindow, error }),
    ).not.toThrow();

    expect(errorEvents).toHaveLength(1);
    expect(errorEvents[0].error).toBe(error);
    expect(errorEvents[0].message).toContain('could not be converted');
  });

  it('logs when there is no polyfill window to report to', () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const error = new Error('guest failure');

    reportErrorToPolyfillWindow({ polyfillWindow: null, error });
    reportErrorToPolyfillWindow({ polyfillWindow: {}, error });

    expect(consoleErrorSpy).toHaveBeenCalledTimes(2);

    consoleErrorSpy.mockRestore();
  });
});
