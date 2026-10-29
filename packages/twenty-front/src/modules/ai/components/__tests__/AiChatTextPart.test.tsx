import { act, render, screen } from '@testing-library/react';

import { AiChatTextPart } from '@/ai/components/AiChatTextPart';

jest.mock('@/ai/components/LazyMarkdownRenderer', () => ({
  LazyMarkdownContent: ({ text }: { text: string }) => (
    <div data-testid="markdown">{text}</div>
  ),
}));

const TEXT = 'Pipeline hygiene keeps every forecast honest and current.';

const getShownText = () => screen.getByTestId('markdown').textContent ?? '';

describe('AiChatTextPart', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows a finished text whole', () => {
    render(
      <AiChatTextPart text={TEXT} isStreaming={false} displayMode="chat" />,
    );

    expect(getShownText()).toBe(TEXT);
  });

  it('reveals a streaming text word by word until it is whole', () => {
    render(<AiChatTextPart text={TEXT} isStreaming displayMode="chat" />);

    const shownTexts = [getShownText()];

    for (let frame = 0; frame < 120 && getShownText() !== TEXT; frame++) {
      act(() => {
        jest.advanceTimersByTime(16);
      });
      shownTexts.push(getShownText());
    }

    expect(getShownText()).toBe(TEXT);
    expect(new Set(shownTexts).size).toBeGreaterThan(3);
    shownTexts.filter(Boolean).forEach((shownText) => {
      expect(TEXT.startsWith(shownText)).toBe(true);
      expect(
        shownText.length === TEXT.length || /\s/.test(TEXT[shownText.length]),
      ).toBe(true);
    });
  });
});
