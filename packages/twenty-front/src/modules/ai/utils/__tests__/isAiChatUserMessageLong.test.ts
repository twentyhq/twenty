import { isAiChatUserMessageLong } from '@/ai/utils/isAiChatUserMessageLong';

const buildLines = (lineCount: number, separator = '\n') =>
  Array.from({ length: lineCount }, (_, index) => `Step ${index + 1}`).join(
    separator,
  );

describe('isAiChatUserMessageLong', () => {
  it('keeps a short message open', () => {
    expect(isAiChatUserMessageLong('Which deals close this week?')).toBe(false);
  });

  it('flags a message of 1000 characters or more', () => {
    expect(isAiChatUserMessageLong('a'.repeat(999))).toBe(false);
    expect(isAiChatUserMessageLong('a'.repeat(1000))).toBe(true);
  });

  it('flags a message of 12 lines or more', () => {
    expect(isAiChatUserMessageLong(buildLines(11))).toBe(false);
    expect(isAiChatUserMessageLong(buildLines(12))).toBe(true);
  });

  it('ignores blank lines between paragraphs', () => {
    expect(isAiChatUserMessageLong(buildLines(11, '\n\n'))).toBe(false);
  });
});
