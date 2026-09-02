import { createWebSpeechDictationEngine } from '@/ai/dictation/engines/createWebSpeechDictationEngine';
import { type DictationEngineEvent } from '@/ai/dictation/types/DictationEngineEvent';
import { type WebSpeechRecognitionConstructor } from '@/ai/dictation/types/WebSpeechRecognitionConstructor';
import { type WebSpeechRecognitionEvent } from '@/ai/dictation/types/WebSpeechRecognitionEvent';
import { type WebSpeechRecognitionInstance } from '@/ai/dictation/types/WebSpeechRecognitionInstance';

// endSession is the test's stand-in for the recognizer reporting it finished,
// which is the only thing that releases the started slot below.
type FakeRecognition = WebSpeechRecognitionInstance & {
  start: jest.Mock;
  stop: jest.Mock;
  abort: jest.Mock;
  endSession: () => void;
};

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

// Models the spec's [[started]] slot, so a test cannot assert a sequence a real
// recognizer would refuse: start() throws while the previous session is still
// started, and only the end event releases it.
const stubSpeechRecognition = () => {
  const instances: FakeRecognition[] = [];

  (window as SpeechRecognitionTestWindow).SpeechRecognition =
    function SpeechRecognition(this: FakeRecognition) {
      let isStarted = false;

      this.start = jest.fn(() => {
        if (isStarted) {
          throw new DOMException(
            'recognition has already started',
            'InvalidStateError',
          );
        }

        isStarted = true;
      });
      this.stop = jest.fn();
      this.abort = jest.fn();
      this.endSession = () => {
        isStarted = false;
        this.onend?.();
      };

      instances.push(this);
    } as unknown as WebSpeechRecognitionConstructor;

  return instances;
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

describe('createWebSpeechDictationEngine', () => {
  let instances: FakeRecognition[] = [];

  const createTestEngine = ({
    isIOS = false,
    getLanguage = () => 'en-US',
  }: { isIOS?: boolean; getLanguage?: () => string } = {}) =>
    createWebSpeechDictationEngine({ isIOS, getLanguage });

  const collectEvents = (engine: {
    subscribe: (listener: (event: DictationEngineEvent) => void) => () => void;
  }) => {
    const events: DictationEngineEvent[] = [];

    engine.subscribe((event) => events.push(event));

    return events;
  };

  const readStates = (events: DictationEngineEvent[]) =>
    events.flatMap((event) => (event.type === 'state' ? [event.state] : []));

  beforeEach(() => {
    const { stream } = createFakeStream();

    mockGetUserMedia(() => Promise.resolve(stream));
    instances = stubSpeechRecognition();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete (window as SpeechRecognitionTestWindow).SpeechRecognition;
  });

  // getUserMedia resolves whenever the user answers the permission prompt, which
  // can be long after the caller gave up. The engine has to notice.
  it('does not start recognition when stopped during the microphone warm-up', async () => {
    const deferred = createDeferred<MediaStream>();
    const { stream } = createFakeStream();

    mockGetUserMedia(() => deferred.promise);

    const engine = createTestEngine({ isIOS: true });
    const startPromise = engine.start();

    engine.stop();
    deferred.resolve(stream);
    await startPromise;

    expect(instances).toHaveLength(0);
  });

  it('releases a microphone that arrives after the engine was disposed', async () => {
    const deferred = createDeferred<MediaStream>();
    const { stream, stop } = createFakeStream();

    mockGetUserMedia(() => deferred.promise);

    const engine = createTestEngine({ isIOS: true });
    const startPromise = engine.start();

    engine.dispose();
    deferred.resolve(stream);
    await startPromise;

    expect(stop).toHaveBeenCalledTimes(1);
    expect(instances).toHaveLength(0);
  });

  it('starts recognition when the warm-up completes uninterrupted', async () => {
    const engine = createTestEngine({ isIOS: true });

    await engine.start();

    expect(instances[0]?.start).toHaveBeenCalledTimes(1);
  });

  // A result that settles an utterance carries no interim for it, so without an
  // explicit clear the hint keeps showing words already inserted below it.
  it('clears the interim hint when an utterance settles', async () => {
    const engine = createTestEngine();
    const events = collectEvents(engine);

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
    const engine = createTestEngine();

    await engine.start();
    engine.cancel();

    expect(instances[0]?.abort).toHaveBeenCalledTimes(1);
  });

  // Re-instantiating per press is what produces the iOS system chime and the
  // first-attempt failures, so a recognizer that finished is used again.
  it('reuses the recognizer once it has reported the session ended', async () => {
    const engine = createTestEngine({ isIOS: true });

    await engine.start();
    engine.stop();
    instances[0]?.endSession();

    await engine.start();

    expect(instances).toHaveLength(1);
    expect(instances[0]?.start).toHaveBeenCalledTimes(2);
  });

  // iOS can end a session without firing onend, and a recognizer that never
  // reported its end throws InvalidStateError on the next start().
  it('replaces a recognizer that never reported the session ended', async () => {
    const engine = createTestEngine({ isIOS: true });
    const events = collectEvents(engine);

    await engine.start();
    engine.stop();

    // Deliberately no end event: this is the platform behaviour being guarded.
    await engine.start();

    expect(instances).toHaveLength(2);
    expect(instances[1]?.start).toHaveBeenCalledTimes(1);
    expect(events).not.toContainEqual({
      type: 'error',
      reason: 'engine-error',
    });
  });

  // The caller only starts again from 'idle', so a state left at 'recording'
  // wedges the button into offering to stop a session that is already over.
  it.each(['stop', 'cancel'] as const)(
    'reports idle on %s even when onend never fires',
    async (method) => {
      const engine = createTestEngine({ isIOS: true });
      const events = collectEvents(engine);

      await engine.start();
      engine[method]();

      expect(readStates(events).at(-1)).toBe('idle');
    },
  );

  // The listener must not outlive its session: onend is what normally removes
  // it, and iOS can end a session without firing onend.
  it.each(['stop', 'cancel'] as const)(
    'removes the visibility listener on %s even when onend never fires',
    async (method) => {
      const removeEventListener = jest.spyOn(document, 'removeEventListener');
      const engine = createTestEngine({ isIOS: true });

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
    const engine = createTestEngine();
    const events = collectEvents(engine);

    await engine.start();
    engine.stop();
    instances[0]?.endSession();

    expect(readStates(events).filter((state) => state === 'idle')).toHaveLength(
      1,
    );
  });

  // Every message send cancels, dictating or not, so cancelling an idle engine
  // is the common case rather than an edge one.
  it('does nothing when cancelling an engine that is not dictating', () => {
    const engine = createTestEngine();
    const events = collectEvents(engine);

    engine.cancel();

    expect(instances).toHaveLength(0);
    expect(events).toEqual([]);
  });

  // stop() clears the session eagerly but the recognizer can still be settling.
  // A send in that window must abort it, or its last final result is inserted
  // into the composer the send just cleared.
  it('still aborts a settling recognizer when cancelled after stop', async () => {
    const engine = createTestEngine();

    await engine.start();
    engine.stop();
    engine.cancel();

    expect(instances[0]?.abort).toHaveBeenCalledTimes(1);
  });

  // An error ends the session, and iOS can skip the end event that follows it.
  it('reports the failure and ends the session on a recognizer error', async () => {
    const engine = createTestEngine({ isIOS: true });
    const events = collectEvents(engine);

    await engine.start();
    instances[0]?.onerror?.({ error: 'audio-capture' });

    expect(events).toContainEqual({ type: 'error', reason: 'no-device' });
    expect(readStates(events).at(-1)).toBe('idle');
  });

  // The API reads lang at start(), so a speaker who changes their language mid
  // session keeps that session and gets the new one on their next press —
  // rebuilding the engine to apply it would abort what they are saying.
  it('reads the language at the start of each session', async () => {
    const languages = ['en-US', 'fr-FR'];
    const engine = createTestEngine({
      getLanguage: () => languages.shift() ?? 'en-US',
    });

    await engine.start();

    expect(instances[0]?.lang).toBe('en-US');

    engine.stop();
    instances[0]?.endSession();

    await engine.start();

    expect(instances).toHaveLength(1);
    expect(instances[0]?.lang).toBe('fr-FR');
  });

  // The end event of a session that is already over must not abandon a press
  // that is still warming up its microphone, or that press is silently lost.
  it('keeps a start warming up when a previous session finally reports its end', async () => {
    const engine = createTestEngine();

    await engine.start();
    engine.stop();

    const deferred = createDeferred<MediaStream>();
    const { stream } = createFakeStream();

    mockGetUserMedia(() => deferred.promise);

    const startPromise = engine.start();

    instances[0]?.endSession();
    deferred.resolve(stream);
    await startPromise;

    expect(instances).toHaveLength(1);
    expect(instances[0]?.start).toHaveBeenCalledTimes(2);
  });
});
