import { describe, expect, it } from 'vitest';

import { TELEGRAM_PLAIN_MESSAGE_MAX_LENGTH } from 'src/logic-functions/constants/telegram-plain-message-max-length';
import { TELEGRAM_RICH_MESSAGE_MAX_LENGTH } from 'src/logic-functions/constants/telegram-rich-message-max-length';
import { buildTelegramAssistantAnswerText } from 'src/logic-functions/utils/build-telegram-assistant-answer-text';

describe('buildTelegramAssistantAnswerText', () => {
  const longAnswer = `${'x'.repeat(99)}\n`.repeat(400);

  it('shortens a rich answer over the limit on a line break and links to the full one', () => {
    const answerText = buildTelegramAssistantAnswerText({
      responseText: longAnswer,
      requestId: 'request-1',
      workspaceBaseUrl: 'https://acme.twenty.example',
      maxLength: TELEGRAM_RICH_MESSAGE_MAX_LENGTH,
      isPlainText: false,
    });

    expect([...answerText].length).toBeLessThanOrEqual(
      TELEGRAM_RICH_MESSAGE_MAX_LENGTH,
    );
    expect(answerText).toMatch(
      /x{99}\n\n_Shortened to fit Telegram\. \[Read the full answer in Twenty\]\(https:\/\/acme\.twenty\.example\/object\/telegramAssistantRequest\/request-1\)_$/,
    );
  });

  it('shortens the plain-text fallback to its own limit with a bare link', () => {
    const answerText = buildTelegramAssistantAnswerText({
      responseText: longAnswer,
      requestId: 'request-1',
      workspaceBaseUrl: 'https://acme.twenty.example',
      maxLength: TELEGRAM_PLAIN_MESSAGE_MAX_LENGTH,
      isPlainText: true,
    });

    expect([...answerText].length).toBeLessThanOrEqual(
      TELEGRAM_PLAIN_MESSAGE_MAX_LENGTH,
    );
    expect(answerText).toMatch(
      /x{99}\n\nShortened to fit Telegram\. Read the full answer in Twenty: https:\/\/acme\.twenty\.example\/object\/telegramAssistantRequest\/request-1$/,
    );
  });

  it('closes a code block the cut left open', () => {
    const answerText = buildTelegramAssistantAnswerText({
      responseText: `\`\`\`\n${'code line\n'.repeat(4000)}\`\`\``,
      requestId: 'request-1',
      workspaceBaseUrl: undefined,
      maxLength: TELEGRAM_RICH_MESSAGE_MAX_LENGTH,
      isPlainText: false,
    });

    expect(answerText).toContain(
      'code line\n```\n\nShortened to fit Telegram.',
    );
  });
});
