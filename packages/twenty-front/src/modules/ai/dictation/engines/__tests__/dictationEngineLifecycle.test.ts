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
});
