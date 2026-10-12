import { createDictationEventEmitter } from '@/ai/dictation/utils/createDictationEventEmitter';

describe('createDictationEventEmitter', () => {
  it('delivers events to every subscriber', () => {
    const emitter = createDictationEventEmitter();
    const first = jest.fn();
    const second = jest.fn();

    emitter.subscribe(first);
    emitter.subscribe(second);
    emitter.emit({ type: 'final', text: 'hello' });

    expect(first).toHaveBeenCalledWith({ type: 'final', text: 'hello' });
    expect(second).toHaveBeenCalledWith({ type: 'final', text: 'hello' });
  });

  it('stops delivering after unsubscribe', () => {
    const emitter = createDictationEventEmitter();
    const listener = jest.fn();

    const unsubscribe = emitter.subscribe(listener);

    unsubscribe();
    emitter.emit({ type: 'state', state: 'idle' });

    expect(listener).not.toHaveBeenCalled();
  });

  it('still reaches later listeners when an earlier one unsubscribes mid-emit', () => {
    const emitter = createDictationEventEmitter();
    const later = jest.fn();

    const unsubscribeFirst = emitter.subscribe(() => {
      unsubscribeFirst();
    });

    emitter.subscribe(later);
    emitter.emit({ type: 'state', state: 'recording' });

    expect(later).toHaveBeenCalledTimes(1);
  });

  it('drops every listener on clear', () => {
    const emitter = createDictationEventEmitter();
    const listener = jest.fn();

    emitter.subscribe(listener);
    emitter.clear();
    emitter.emit({ type: 'state', state: 'idle' });

    expect(listener).not.toHaveBeenCalled();
  });
});
