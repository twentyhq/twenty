import { createWebSpeechDictationEngine } from '@/ai/dictation/engines/createWebSpeechDictationEngine';
import { type DictationEngineEvent } from '@/ai/dictation/types/DictationEngine';
import {
  type WebSpeechRecognitionConstructor,
  type WebSpeechRecognitionEvent,
  type WebSpeechRecognitionInstance,
} from '@/ai/dictation/types/WebSpeechRecognition';

type SpeechRecognitionTestWindow = {
  SpeechRecognition?: WebSpeechRecognitionConstructor;
};

const createDeferred = <TValue>() => {
  let resolve: (value: TValue) => void = () => {};
  const promise = new Promise<TValue>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
};

const createFakeStream = () => {
  const stop = jest.fn();

  return {
    stream: { getTracks: () => [{ stop }] } as unknown as MediaStream,
    stop,
  };
};

const mockGetUserMedia = (implementation: () => Promise<MediaStream>) => {
  Object.defineProperty(navigator, 'mediaDevices', {
    value: { getUserMedia: jest.fn(implementation) },
    configurable: true,
  });
};

const stubSpeechRecognition = (start: jest.Mock) => {
  (window as SpeechRecognitionTestWindow).SpeechRecognition =
    function SpeechRecognition(this: Record<string, unknown>) {
      this.start = start;
      this.stop = jest.fn();
      this.abort = jest.fn();
    } as unknown as WebSpeechRecognitionConstructor;
};

// Captures the instance so a test can drive onresult the way the browser does.
const stubCapturingSpeechRecognition = () => {
  const abort = jest.fn();
  const instances: WebSpeechRecognitionInstance[] = [];

  (window as SpeechRecognitionTestWindow).SpeechRecognition =
    function SpeechRecognition(this: Record<string, unknown>) {
      this.start = jest.fn();
      this.stop = jest.fn();
      this.abort = abort;
      instances.push(this as unknown as WebSpeechRecognitionInstance);
    } as unknown as WebSpeechRecognitionConstructor;

  return { abort, instances };
};

const buildResultEvent = ({
  transcript,
  isFinal,
}: {
  transcript: string;
  isFinal: boolean;
}) =>
  ({
    resultIndex: 0,
    results: [Object.assign([{ transcript }], { isFinal })],
  }) as unknown as WebSpeechRecognitionEvent;

// getUserMedia resolves whenever the user answers the permission prompt, which
// can be long after the caller gave up. The engine has to notice.
describe('createWebSpeechDictationEngine', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete (window as SpeechRecognitionTestWindow).SpeechRecognition;
  });

  it('does not start recognition when stopped during the microphone warm-up', async () => {
    const deferred = createDeferred<MediaStream>();
    const { stream } = createFakeStream();

    mockGetUserMedia(() => deferred.promise);

    const start = jest.fn();

    stubSpeechRecognition(start);

    const engine = createWebSpeechDictationEngine({
      isIOS: true,
      language: 'en-US',
    });

    const startPromise = engine.start();

    engine.stop();
    deferred.resolve(stream);
    await startPromise;

    expect(start).not.toHaveBeenCalled();
  });

  it('releases a microphone that arrives after the engine was disposed', async () => {
    const deferred = createDeferred<MediaStream>();
    const { stream, stop } = createFakeStream();

    mockGetUserMedia(() => deferred.promise);

    const start = jest.fn();

    stubSpeechRecognition(start);

    const engine = createWebSpeechDictationEngine({
      isIOS: true,
      language: 'en-US',
    });

    const startPromise = engine.start();

    engine.dispose();
    deferred.resolve(stream);
    await startPromise;

    expect(stop).toHaveBeenCalledTimes(1);
    expect(start).not.toHaveBeenCalled();
  });

  it('starts recognition when the warm-up completes uninterrupted', async () => {
    const { stream } = createFakeStream();

    mockGetUserMedia(() => Promise.resolve(stream));

    const start = jest.fn();

    stubSpeechRecognition(start);

    const engine = createWebSpeechDictationEngine({
      isIOS: true,
      language: 'en-US',
    });

    await engine.start();

    expect(start).toHaveBeenCalledTimes(1);
  });

  // A result that settles an utterance carries no interim for it, so without an
  // explicit clear the hint keeps showing words already inserted below it.
  it('clears the interim hint when an utterance settles', async () => {
    const { stream } = createFakeStream();

    mockGetUserMedia(() => Promise.resolve(stream));

    const { instances } = stubCapturingSpeechRecognition();

    const engine = createWebSpeechDictationEngine({
      isIOS: false,
      language: 'en-US',
    });
    const events: DictationEngineEvent[] = [];

    engine.subscribe((event) => events.push(event));

    await engine.start();

    instances[0]?.onresult?.(
      buildResultEvent({ transcript: 'hello there', isFinal: true }),
    );

    expect(events).toContainEqual({ type: 'final', text: 'hello there' });
    expect(events).toContainEqual({ type: 'interim', text: '' });
  });

  // Sending takes the composer's content with it, so a half-heard utterance
  // belongs to neither the sent message nor the next draft.
  it('discards in-flight audio on cancel without delivering a result', async () => {
    const { stream } = createFakeStream();

    mockGetUserMedia(() => Promise.resolve(stream));

    const { abort } = stubCapturingSpeechRecognition();

    const engine = createWebSpeechDictationEngine({
      isIOS: false,
      language: 'en-US',
    });

    await engine.start();
    engine.cancel();

    expect(abort).toHaveBeenCalledTimes(1);
  });

  // iOS can end a session without firing onend. If that left isActive true, the
  // start guard would refuse every later attempt for the life of the page.
  it('can start again after a stop that never fired onend', async () => {
    const { stream } = createFakeStream();

    mockGetUserMedia(() => Promise.resolve(stream));

    const { instances } = stubCapturingSpeechRecognition();

    const engine = createWebSpeechDictationEngine({
      isIOS: true,
      language: 'en-US',
    });

    await engine.start();
    engine.stop();

    // Deliberately no onend: this is the platform behaviour being guarded.
    await engine.start();

    expect(instances).toHaveLength(1);
    expect(instances[0]?.start).toHaveBeenCalledTimes(2);
  });

  // The caller only starts again from 'idle', so a state left at 'listening'
  // wedges the button into offering to stop a session that is already over.
  it('reports idle on stop even when onend never fires', async () => {
    const { stream } = createFakeStream();

    mockGetUserMedia(() => Promise.resolve(stream));
    stubCapturingSpeechRecognition();

    const engine = createWebSpeechDictationEngine({
      isIOS: true,
      language: 'en-US',
    });
    const states: string[] = [];

    engine.subscribe((event) => {
      if (event.type === 'state') {
        states.push(event.state);
      }
    });

    await engine.start();
    engine.stop();

    expect(states.at(-1)).toBe('idle');
  });

  it('reports idle on cancel even when onend never fires', async () => {
    const { stream } = createFakeStream();

    mockGetUserMedia(() => Promise.resolve(stream));
    stubCapturingSpeechRecognition();

    const engine = createWebSpeechDictationEngine({
      isIOS: true,
      language: 'en-US',
    });
    const states: string[] = [];

    engine.subscribe((event) => {
      if (event.type === 'state') {
        states.push(event.state);
      }
    });

    await engine.start();
    engine.cancel();

    expect(states.at(-1)).toBe('idle');
  });

  // The listener must not outlive its session: onend is what normally removes
  // it, and iOS can end a session without firing onend.
  it.each(['stop', 'cancel'] as const)(
    'removes the visibility listener on %s even when onend never fires',
    async (method) => {
      const { stream } = createFakeStream();

      mockGetUserMedia(() => Promise.resolve(stream));
      stubCapturingSpeechRecognition();

      const removeEventListener = jest.spyOn(document, 'removeEventListener');

      const engine = createWebSpeechDictationEngine({
        isIOS: true,
        language: 'en-US',
      });

      await engine.start();
      engine[method]();

      expect(removeEventListener).toHaveBeenCalledWith(
        'visibilitychange',
        expect.any(Function),
      );
    },
  );

  // A session ends once. onend arriving after an explicit stop must not report
  // a second one, or a caller counting session ends sees two per session.
  it('reports idle once when stop is followed by onend', async () => {
    const { stream } = createFakeStream();

    mockGetUserMedia(() => Promise.resolve(stream));

    const { instances } = stubCapturingSpeechRecognition();

    const engine = createWebSpeechDictationEngine({
      isIOS: false,
      language: 'en-US',
    });
    const idleCount = { value: 0 };

    engine.subscribe((event) => {
      if (event.type === 'state' && event.state === 'idle') {
        idleCount.value += 1;
      }
    });

    await engine.start();
    engine.stop();
    instances[0]?.onend?.();

    expect(idleCount.value).toBe(1);
  });

  // Every message send cancels, dictating or not, so cancelling an idle engine
  // is the common case rather than an edge one.
  it('does nothing when cancelling an engine that is not dictating', async () => {
    const { abort } = stubCapturingSpeechRecognition();

    const engine = createWebSpeechDictationEngine({
      isIOS: false,
      language: 'en-US',
    });
    const events: string[] = [];

    engine.subscribe((event) => events.push(event.type));

    engine.cancel();

    expect(abort).not.toHaveBeenCalled();
    expect(events).toEqual([]);
  });
});
