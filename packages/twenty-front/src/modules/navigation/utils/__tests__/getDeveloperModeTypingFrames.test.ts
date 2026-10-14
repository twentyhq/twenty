import { getDeveloperModeTypingFrames } from '@/navigation/utils/getDeveloperModeTypingFrames';

describe('getDeveloperModeTypingFrames', () => {
  const frames = getDeveloperModeTypingFrames({
    greeting: 'hi',
    words: ['logs'],
    restingWord: 'CLI',
  });
  const texts = frames.map((frame) => frame.text);

  it('types and erases the greeting and each word once, then rests on the last word', () => {
    expect(texts).toEqual([
      '',
      'h',
      'hi',
      'h',
      '',
      'l',
      'lo',
      'log',
      'logs',
      'log',
      'lo',
      'l',
      '',
      'C',
      'CL',
      'CLI',
    ]);
  });

  it('holds each fully typed word before erasing it', () => {
    const greetingFrame = frames[texts.indexOf('hi')];
    const wordFrame = frames[texts.indexOf('logs')];

    expect(greetingFrame.delayAfterMs).toBeGreaterThan(1000);
    expect(wordFrame.delayAfterMs).toBeGreaterThan(1000);
  });
});
