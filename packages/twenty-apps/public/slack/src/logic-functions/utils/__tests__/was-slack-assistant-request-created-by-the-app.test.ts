import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { wasSlackAssistantRequestCreatedByTheApp } from 'src/logic-functions/utils/was-slack-assistant-request-created-by-the-app';

const { findSlackAssistantRequestCreatedByMock } = vi.hoisted(() => ({
  findSlackAssistantRequestCreatedByMock: vi.fn(),
}));

vi.mock(
  'src/logic-functions/data/find-slack-assistant-request-created-by',
  () => ({
    findSlackAssistantRequestCreatedBy: findSlackAssistantRequestCreatedByMock,
  }),
);

const client = {} as CoreApiClient;
const REQUEST_ID = 'request-1';

describe('wasSlackAssistantRequestCreatedByTheApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should accept a request the app wrote while handling a Slack event', async () => {
    findSlackAssistantRequestCreatedByMock.mockResolvedValue({
      source: 'APPLICATION',
      workspaceMemberId: null,
    });

    expect(
      await wasSlackAssistantRequestCreatedByTheApp(client, REQUEST_ID),
    ).toBe(true);
  });

  it('should reject a request created by hand in the UI', async () => {
    findSlackAssistantRequestCreatedByMock.mockResolvedValue({
      source: 'MANUAL',
      workspaceMemberId: 'member-1',
    });

    expect(
      await wasSlackAssistantRequestCreatedByTheApp(client, REQUEST_ID),
    ).toBe(false);
  });

  it('should reject a request whose actor claims the app but carries a member', async () => {
    findSlackAssistantRequestCreatedByMock.mockResolvedValue({
      source: 'APPLICATION',
      workspaceMemberId: 'member-1',
    });

    expect(
      await wasSlackAssistantRequestCreatedByTheApp(client, REQUEST_ID),
    ).toBe(false);
  });

  it('should reject when the actor cannot be read', async () => {
    findSlackAssistantRequestCreatedByMock.mockResolvedValue(undefined);

    expect(
      await wasSlackAssistantRequestCreatedByTheApp(client, REQUEST_ID),
    ).toBe(false);
  });

  it('should reject when the lookup throws', async () => {
    findSlackAssistantRequestCreatedByMock.mockRejectedValue(
      new Error('permission denied'),
    );

    expect(
      await wasSlackAssistantRequestCreatedByTheApp(client, REQUEST_ID),
    ).toBe(false);
  });
});
