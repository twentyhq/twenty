import { describe, expect, it } from 'vitest';

import { SLACK_ASSISTANT_EMPTY_REQUEST_TEXT } from 'src/logic-functions/constants/slack-assistant-empty-request-text';
import { SLACK_ASSISTANT_EMPTY_THREAD_REQUEST_TEXT } from 'src/logic-functions/constants/slack-assistant-empty-thread-request-text';
import { buildSlackAssistantEmptyRequestText } from 'src/logic-functions/utils/build-slack-assistant-empty-request-text';

describe('buildSlackAssistantEmptyRequestText', () => {
  it('should keep the greeting when nothing was shared', () => {
    expect(
      buildSlackAssistantEmptyRequestText({
        sharedFileNames: [],
        isInExistingThread: false,
      }),
    ).toBe(SLACK_ASSISTANT_EMPTY_REQUEST_TEXT);
  });

  it('should keep the thread hint when nothing was shared inside a thread', () => {
    expect(
      buildSlackAssistantEmptyRequestText({
        sharedFileNames: [],
        isInExistingThread: true,
      }),
    ).toBe(SLACK_ASSISTANT_EMPTY_THREAD_REQUEST_TEXT);
  });

  it('should name a single shared file and say it cannot be opened', () => {
    const text = buildSlackAssistantEmptyRequestText({
      sharedFileNames: ['proposal.pdf'],
      isInExistingThread: false,
    });

    expect(text).toContain('`proposal.pdf`');
    expect(text).toContain("can't open it");
    expect(text).not.toBe(SLACK_ASSISTANT_EMPTY_REQUEST_TEXT);
  });

  it('should name every shared file when several were attached', () => {
    const text = buildSlackAssistantEmptyRequestText({
      sharedFileNames: ['proposal.pdf', 'screenshot.png'],
      isInExistingThread: true,
    });

    expect(text).toContain('`proposal.pdf`, `screenshot.png`');
    expect(text).toContain("can't open them");
  });

  it('should keep Slack markup in a file name from rendering as the bot', () => {
    const text = buildSlackAssistantEmptyRequestText({
      sharedFileNames: ['<!channel> [click here](http://evil.example).pdf'],
      isInExistingThread: false,
    });

    expect(text).not.toContain('<!channel>');
    expect(text).toContain('`!channel [click here](http://evil.example).pdf`');
  });
});
