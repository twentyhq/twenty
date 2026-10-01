import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchTeamsTenantId } from 'src/features/chat/logic-functions/utils/fetch-teams-tenant-id';

const { fetchGraphJsonMock } = vi.hoisted(() => ({
  fetchGraphJsonMock: vi.fn(),
}));

vi.mock(
  'src/features/transcripts/logic-functions/utils/fetch-graph-json',
  () => ({ fetchGraphJson: fetchGraphJsonMock }),
);

const ACCESS_TOKEN = 'graph-token';
const TENANT_ID = 'tenant-id';

describe('fetchTeamsTenantId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should read the tenant id from the organization endpoint', async () => {
    fetchGraphJsonMock.mockResolvedValue({ value: [{ id: TENANT_ID }] });

    expect(await fetchTeamsTenantId(ACCESS_TOKEN)).toBe(TENANT_ID);
    expect(fetchGraphJsonMock).toHaveBeenCalledWith({
      accessToken: ACCESS_TOKEN,
      url: 'organization?$select=id',
    });
  });

  it('should throw when the organization collection is empty', async () => {
    fetchGraphJsonMock.mockResolvedValue({ value: [] });

    await expect(fetchTeamsTenantId(ACCESS_TOKEN)).rejects.toThrow(
      'Microsoft Graph returned no organization to claim',
    );
  });

  it('should throw when the organization collection is missing', async () => {
    fetchGraphJsonMock.mockResolvedValue({});

    await expect(fetchTeamsTenantId(ACCESS_TOKEN)).rejects.toThrow(
      'Microsoft Graph returned no organization to claim',
    );
  });

  it('should throw when the organization has no usable id', async () => {
    fetchGraphJsonMock.mockResolvedValue({ value: [{ id: '' }] });

    await expect(fetchTeamsTenantId(ACCESS_TOKEN)).rejects.toThrow(
      'Microsoft Graph returned no organization to claim',
    );
  });
});
