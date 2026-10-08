import { describe, expect, it } from 'vitest';

import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { SLACK_ASSISTANT_REQUEST_TIMEOUT_SECONDS } from 'src/logic-functions/constants/slack-assistant-request-timeout-seconds';
import { isSlackAssistantRequestResumable } from 'src/logic-functions/utils/is-slack-assistant-request-resumable';

const NOW_MS = Date.parse('2026-09-10T12:00:00.000Z');
const LEASE_MS = SLACK_ASSISTANT_REQUEST_TIMEOUT_SECONDS * 1000;

describe('isSlackAssistantRequestResumable', () => {
  it('should resume a pending request', () => {
    expect(
      isSlackAssistantRequestResumable(
        { status: SLACK_ASSISTANT_REQUEST_STATUS.PENDING },
        { nowMs: NOW_MS },
      ),
    ).toBe(true);
  });

  it('should leave a request whose execution can still be alive alone', () => {
    expect(
      isSlackAssistantRequestResumable(
        {
          status: SLACK_ASSISTANT_REQUEST_STATUS.PROCESSING,
          updatedAt: new Date(NOW_MS - LEASE_MS + 1000).toISOString(),
        },
        { nowMs: NOW_MS },
      ),
    ).toBe(false);
  });

  it('should resume a request whose execution died mid-answer', () => {
    expect(
      isSlackAssistantRequestResumable(
        {
          status: SLACK_ASSISTANT_REQUEST_STATUS.PROCESSING,
          updatedAt: new Date(NOW_MS - LEASE_MS - 1000).toISOString(),
        },
        { nowMs: NOW_MS },
      ),
    ).toBe(true);
  });

  it('should not resume a processing request without a last update time', () => {
    expect(
      isSlackAssistantRequestResumable(
        { status: SLACK_ASSISTANT_REQUEST_STATUS.PROCESSING },
        { nowMs: NOW_MS },
      ),
    ).toBe(false);
  });

  it.each([
    SLACK_ASSISTANT_REQUEST_STATUS.DONE,
    SLACK_ASSISTANT_REQUEST_STATUS.FAILED,
  ])('should never resume a %s request', (status) => {
    expect(
      isSlackAssistantRequestResumable(
        { status, updatedAt: new Date(NOW_MS - LEASE_MS - 1000).toISOString() },
        { nowMs: NOW_MS },
      ),
    ).toBe(false);
  });
});
