import { unlockAudioContext } from '@/ai/dictation/utils/unlockAudioContext';

type AudioContextTestWindow = {
  AudioContext?: typeof AudioContext;
};

const stubAudioContext = ({
  doesResumeReject = false,
}: { doesResumeReject?: boolean } = {}) => {
  const close = jest.fn(() => Promise.resolve());
  const resume = jest.fn(() =>
    doesResumeReject
      ? Promise.reject(new DOMException('not allowed', 'InvalidStateError'))
      : Promise.resolve(),
  );

  (window as AudioContextTestWindow).AudioContext = function AudioContext(
    this: Record<string, unknown>,
  ) {
    this.state = 'suspended';
    this.resume = resume;
    this.close = close;
  } as unknown as typeof AudioContext;

  return { close, resume };
};

describe('unlockAudioContext', () => {
  afterEach(() => {
    delete (window as AudioContextTestWindow).AudioContext;
  });

  it('releases the context it opened', async () => {
    const { close, resume } = stubAudioContext();

    await unlockAudioContext();

    expect(resume).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
  });

  // A browser allows only a handful of live contexts, and resume() rejecting is
  // routine on the surface this exists for, so leaking one per press would
  // exhaust the pool the unlock depends on.
  it('releases the context even when resuming it fails', async () => {
    const { close } = stubAudioContext({ doesResumeReject: true });

    await expect(unlockAudioContext()).resolves.toBeUndefined();

    expect(close).toHaveBeenCalledTimes(1);
  });

  it('does nothing on a browser with no audio context', async () => {
    await expect(unlockAudioContext()).resolves.toBeUndefined();
  });
});
