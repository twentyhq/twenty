import { Window } from '@remote-dom/polyfill';

import { resolvePolyfillHooks } from '@/polyfills/dom/utils/resolvePolyfillHooks';
import { installOutsidePressObservation } from '@/polyfills/events/utils/installOutsidePressObservation';
import { toGlobalScopeRecord } from '@/polyfills/utils/toGlobalScopeRecord';

const createObservationFixture = () => {
  const polyfillWindow = new Window();
  const documentTarget = polyfillWindow.document as unknown as Document;
  const observation = installOutsidePressObservation({
    hooks: resolvePolyfillHooks([toGlobalScopeRecord(polyfillWindow)]),
    documentTarget,
  });
  const transport = {
    observeOutsidePresses: jest.fn().mockResolvedValue(undefined),
    unobserveOutsidePresses: jest.fn().mockResolvedValue(undefined),
  };

  return { polyfillWindow, documentTarget, observation, transport };
};

const flushObservationReports = () => Promise.resolve();

describe('installOutsidePressObservation', () => {
  it('observes outside presses while the document, html or body has a press listener', async () => {
    const { documentTarget, observation, transport } =
      createObservationFixture();
    const handleDocumentPress = jest.fn();
    const handleRootPress = jest.fn();
    const handleBodyPress = jest.fn();
    observation.connectTransport(transport);

    documentTarget.addEventListener('pointerdown', handleDocumentPress, true);
    documentTarget.documentElement.addEventListener('mouseup', handleRootPress);
    documentTarget.body.addEventListener('click', handleBodyPress);
    await flushObservationReports();

    expect(transport.observeOutsidePresses).toHaveBeenCalledTimes(1);

    documentTarget.removeEventListener(
      'pointerdown',
      handleDocumentPress,
      true,
    );
    documentTarget.documentElement.removeEventListener(
      'mouseup',
      handleRootPress,
    );
    await flushObservationReports();

    expect(transport.unobserveOutsidePresses).not.toHaveBeenCalled();

    documentTarget.body.removeEventListener('click', handleBodyPress);
    await flushObservationReports();

    expect(transport.observeOutsidePresses).toHaveBeenCalledTimes(1);
    expect(transport.unobserveOutsidePresses).toHaveBeenCalledTimes(1);
  });

  it('ignores other event types and listeners on other elements', async () => {
    const { documentTarget, observation, transport } =
      createObservationFixture();
    const popup = documentTarget.createElement('div');
    documentTarget.body.append(popup);
    observation.connectTransport(transport);

    documentTarget.addEventListener('keydown', jest.fn());
    documentTarget.body.addEventListener('pointermove', jest.fn());
    popup.addEventListener('pointerdown', jest.fn());
    await flushObservationReports();

    expect(transport.observeOutsidePresses).not.toHaveBeenCalled();
  });

  it('keeps observing when a listener is replaced within one task', async () => {
    const { documentTarget, observation, transport } =
      createObservationFixture();
    const previousListener = jest.fn();
    observation.connectTransport(transport);
    documentTarget.addEventListener('mousedown', previousListener, true);
    await flushObservationReports();

    documentTarget.removeEventListener('mousedown', previousListener, true);
    documentTarget.addEventListener('mousedown', jest.fn(), true);
    await flushObservationReports();

    expect(transport.observeOutsidePresses).toHaveBeenCalledTimes(1);
    expect(transport.unobserveOutsidePresses).not.toHaveBeenCalled();
  });

  it('reports listeners registered before the transport connects', async () => {
    const { documentTarget, observation, transport } =
      createObservationFixture();
    documentTarget.addEventListener('pointerup', jest.fn());
    await flushObservationReports();

    observation.connectTransport(transport);

    expect(transport.observeOutsidePresses).toHaveBeenCalledTimes(1);
  });

  it('stops observing once a one-shot listener runs and an aborted listener is removed', async () => {
    const { polyfillWindow, documentTarget, observation, transport } =
      createObservationFixture();
    const abortController = new AbortController();
    observation.connectTransport(transport);
    documentTarget.addEventListener('mouseup', jest.fn(), { once: true });
    documentTarget.addEventListener('click', jest.fn(), {
      signal: abortController.signal,
    });
    await flushObservationReports();

    polyfillWindow.document.dispatchEvent(new polyfillWindow.Event('mouseup'));
    abortController.abort();
    await flushObservationReports();

    expect(transport.observeOutsidePresses).toHaveBeenCalledTimes(1);
    expect(transport.unobserveOutsidePresses).toHaveBeenCalledTimes(1);
  });
});
