import { describe, expect, it } from 'vitest';

import { getPublicAvatarUrl } from 'src/logic-functions/utils/get-public-avatar-url';

const WORKSPACE_BASE_URL = 'https://acme.twenty.com';

describe('getPublicAvatarUrl', () => {
  it('should keep a public absolute avatar URL', () => {
    expect(
      getPublicAvatarUrl({
        avatarUrl: 'https://cdn.example.com/ada.png',
        workspaceBaseUrls: [WORKSPACE_BASE_URL],
      }),
    ).toBe('https://cdn.example.com/ada.png');
  });

  it('should drop instance-hosted avatars Slack cannot fetch', () => {
    expect(
      getPublicAvatarUrl({
        avatarUrl: `${WORKSPACE_BASE_URL}/files/avatar.png`,
        workspaceBaseUrls: [WORKSPACE_BASE_URL],
      }),
    ).toBeUndefined();
  });

  it('should drop an instance-hosted avatar served from the other workspace host', () => {
    expect(
      getPublicAvatarUrl({
        avatarUrl: 'https://acme.twenty.com/files/avatar.png',
        workspaceBaseUrls: ['https://crm.acme.com', 'https://acme.twenty.com'],
      }),
    ).toBeUndefined();
  });

  it('should drop relative paths and non-string values', () => {
    expect(
      getPublicAvatarUrl({
        avatarUrl: '/files/avatar.png',
        workspaceBaseUrls: [WORKSPACE_BASE_URL],
      }),
    ).toBeUndefined();
    expect(
      getPublicAvatarUrl({
        avatarUrl: null,
        workspaceBaseUrls: [WORKSPACE_BASE_URL],
      }),
    ).toBeUndefined();
  });
});
