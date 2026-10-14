import { type DeveloperModeTypingSequence } from '@/navigation/types/DeveloperModeTypingSequence';
import { getDeveloperModeDisplayedFrame } from '@/navigation/utils/getDeveloperModeDisplayedFrame';

const frame = {
  text: 'De',
  codeFontStart: 0,
  codeFontEnd: 2,
  delayAfterMs: 25,
};

const buildSequence = (
  direction: DeveloperModeTypingSequence['direction'],
): DeveloperModeTypingSequence => ({
  direction,
  frames: [frame, { ...frame, text: 'Dev', codeFontEnd: 3 }],
  index: 0,
});

describe('getDeveloperModeDisplayedFrame', () => {
  it('shows the label in the code font while developer mode is on and nothing plays', () => {
    expect(
      getDeveloperModeDisplayedFrame({
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

  it('shows the current frame of the sequence that turns developer mode on', () => {
    expect(
      getDeveloperModeDisplayedFrame({
        isEnabled: true,
        label: 'Dev',
        sequence: buildSequence('enter'),
      }),
    ).toBe(frame);
  });

  it('shows the current frame of the sequence that turns developer mode off', () => {
    expect(
      getDeveloperModeDisplayedFrame({
        isEnabled: false,
        label: 'Dev',
        sequence: buildSequence('exit'),
      }),
    ).toBe(frame);
  });

  it('shows the plain label once developer mode is off', () => {
    expect(
      getDeveloperModeDisplayedFrame({
        isEnabled: false,
        label: 'Dev',
        sequence: buildSequence('enter'),
      }),
    ).toBeNull();
  });

  it('shows the current label once a sequence has finished, even if the label changed since', () => {
    const finishedSequence = { ...buildSequence('enter'), index: 1 };

    expect(
      getDeveloperModeDisplayedFrame({
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

  it('shows the plain label once the sequence that turns developer mode off has finished', () => {
    expect(
      getDeveloperModeDisplayedFrame({
        isEnabled: false,
        label: 'Dev',
        sequence: { ...buildSequence('exit'), index: 1 },
      }),
    ).toBeNull();
  });
});
