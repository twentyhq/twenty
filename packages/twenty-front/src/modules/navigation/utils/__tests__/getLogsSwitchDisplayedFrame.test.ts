import { type LogsSwitchTypingSequence } from '@/navigation/types/LogsSwitchTypingSequence';
import { getLogsSwitchDisplayedFrame } from '@/navigation/utils/getLogsSwitchDisplayedFrame';

const frame = {
  text: 'De',
  codeFontStart: 0,
  codeFontEnd: 2,
  delayAfterMs: 25,
};

const buildSequence = (
  direction: LogsSwitchTypingSequence['direction'],
): LogsSwitchTypingSequence => ({
  direction,
  frames: [frame, { ...frame, text: 'Dev', codeFontEnd: 3 }],
  index: 0,
});

describe('getLogsSwitchDisplayedFrame', () => {
  it('shows the label in the code font while logs is on and nothing plays', () => {
    expect(
      getLogsSwitchDisplayedFrame({
        isEnabled: true,
        label: 'Dev',
        sequence: null,
      }),
    ).toEqual({
      text: 'Dev',
      codeFontStart: 0,
      codeFontEnd: 3,
      delayAfterMs: 0,
    });
  });

  it('shows the current frame of the sequence that turns logs on', () => {
    expect(
      getLogsSwitchDisplayedFrame({
        isEnabled: true,
        label: 'Dev',
        sequence: buildSequence('enter'),
      }),
    ).toBe(frame);
  });

  it('shows the current frame of the sequence that turns logs off', () => {
    expect(
      getLogsSwitchDisplayedFrame({
        isEnabled: false,
        label: 'Dev',
        sequence: buildSequence('exit'),
      }),
    ).toBe(frame);
  });

  it('shows the plain label once logs is off', () => {
    expect(
      getLogsSwitchDisplayedFrame({
        isEnabled: false,
        label: 'Dev',
        sequence: buildSequence('enter'),
      }),
    ).toBeNull();
  });

  it('shows the current label once a sequence has finished, even if the label changed since', () => {
    const finishedSequence = { ...buildSequence('enter'), index: 1 };

    expect(
      getLogsSwitchDisplayedFrame({
        isEnabled: true,
        label: 'Développeur',
        sequence: finishedSequence,
      }),
    ).toEqual({
      text: 'Développeur',
      codeFontStart: 0,
      codeFontEnd: 11,
      delayAfterMs: 0,
    });
  });

  it('shows the plain label once the sequence that turns logs off has finished', () => {
    expect(
      getLogsSwitchDisplayedFrame({
        isEnabled: false,
        label: 'Dev',
        sequence: { ...buildSequence('exit'), index: 1 },
      }),
    ).toBeNull();
  });
});
