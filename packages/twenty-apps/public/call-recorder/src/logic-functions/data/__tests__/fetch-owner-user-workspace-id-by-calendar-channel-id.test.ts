import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchOwnerUserWorkspaceIdByCalendarChannelId } from 'src/logic-functions/data/fetch-owner-user-workspace-id-by-calendar-channel-id.util';

const metadataQueryMock = vi.hoisted(() => vi.fn());
const metadataClientOptionsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/metadata', () => ({
  MetadataApiClient: class {
    query = metadataQueryMock;

    constructor(options: unknown) {
      metadataClientOptionsMock(options);
    }
  },
}));

describe('fetchOwnerUserWorkspaceIdByCalendarChannelId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps each calendar channel to the member who connected its account', async () => {
    metadataQueryMock.mockResolvedValue({
      calendarChannels: [
        {
          id: 'calendar-channel-1',
          connectedAccount: { userWorkspaceId: 'user-workspace-1' },
        },
        {
          id: 'calendar-channel-2',
          connectedAccount: { userWorkspaceId: 'user-workspace-2' },
        },
      ],
    });

    expect(await fetchOwnerUserWorkspaceIdByCalendarChannelId()).toEqual(
      new Map([
        ['calendar-channel-1', 'user-workspace-1'],
        ['calendar-channel-2', 'user-workspace-2'],
      ]),
    );
  });

  it('leaves out a calendar channel whose connected account is gone', async () => {
    metadataQueryMock.mockResolvedValue({
      calendarChannels: [{ id: 'calendar-channel-1', connectedAccount: null }],
    });

    expect(await fetchOwnerUserWorkspaceIdByCalendarChannelId()).toEqual(
      new Map(),
    );
  });

  it('reads the calendar channels as the application', async () => {
    metadataQueryMock.mockResolvedValue({ calendarChannels: [] });

    await fetchOwnerUserWorkspaceIdByCalendarChannelId();

    expect(metadataClientOptionsMock).toHaveBeenCalledWith(
      expect.objectContaining({ runAs: 'application' }),
    );
  });

  it('fails when the calendar channels cannot be read', async () => {
    metadataQueryMock.mockRejectedValue(new Error('permission denied'));

    await expect(
      fetchOwnerUserWorkspaceIdByCalendarChannelId(),
    ).rejects.toThrow('permission denied');
  });
});
