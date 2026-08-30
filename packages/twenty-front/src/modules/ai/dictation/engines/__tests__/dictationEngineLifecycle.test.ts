import { createWebSpeechDictationEngine } from '@/ai/dictation/engines/createWebSpeechDictationEngine';
import { type WebSpeechRecognitionConstructor } from '@/ai/dictation/types/WebSpeechRecognition';

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
});
