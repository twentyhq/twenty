import { type MetadataApiClient } from 'twenty-client-sdk/metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchCalendarChannelOwnerByCalendarChannelId } from 'src/logic-functions/data/fetch-calendar-channel-owner-by-calendar-channel-id.util';

const metadataQueryMock = vi.hoisted(() => vi.fn());
const metadataClientOptionsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/metadata', () => ({
  MetadataApiClient: class {
    query = metadataQueryMock;

    constructor(options: ConstructorParameters<typeof MetadataApiClient>[0]) {
      metadataClientOptionsMock(options);
    }
  },
}));

describe('fetchCalendarChannelOwnerByCalendarChannelId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps each calendar channel to the member who connected its account and the address it syncs', async () => {
    metadataQueryMock.mockResolvedValue({
      calendarChannels: [
        {
          id: 'calendar-channel-1',
          handle: 'ada@acme.com',
          connectedAccount: { userWorkspaceId: 'user-workspace-1' },
        },
        {
          id: 'calendar-channel-2',
          handle: 'grace@acme.com',
          connectedAccount: { userWorkspaceId: 'user-workspace-2' },
        },
      ],
    });

    expect(await fetchCalendarChannelOwnerByCalendarChannelId()).toEqual(
      new Map([
        [
          'calendar-channel-1',
          { userWorkspaceId: 'user-workspace-1', handle: 'ada@acme.com' },
        ],
        [
          'calendar-channel-2',
          { userWorkspaceId: 'user-workspace-2', handle: 'grace@acme.com' },
        ],
      ]),
    );
  });

  it('leaves out a calendar channel whose connected account is gone', async () => {
    metadataQueryMock.mockResolvedValue({
      calendarChannels: [
        {
          id: 'calendar-channel-1',
          handle: 'ada@acme.com',
          connectedAccount: null,
        },
      ],
    });

    expect(await fetchCalendarChannelOwnerByCalendarChannelId()).toEqual(
      new Map(),
    );
  });

  it('reads the calendar channels as the application', async () => {
    metadataQueryMock.mockResolvedValue({ calendarChannels: [] });

    await fetchCalendarChannelOwnerByCalendarChannelId();

    expect(metadataClientOptionsMock).toHaveBeenCalledWith(
      expect.objectContaining({ runAs: 'application' }),
    );
  });

  it('fails when the calendar channels cannot be read', async () => {
    metadataQueryMock.mockRejectedValue(new Error('permission denied'));

    await expect(
      fetchCalendarChannelOwnerByCalendarChannelId(),
    ).rejects.toThrow('permission denied');
  });
});
