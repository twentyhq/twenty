import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type AppConnection } from 'twenty-sdk/logic-function';

import { listFirefliesTranscriptsAcrossConnections } from 'src/logic-functions/utils/list-fireflies-transcripts-across-connections.util';

const listFirefliesTranscriptsMock = vi.hoisted(() => vi.fn());

vi.mock('src/logic-functions/utils/list-fireflies-transcripts.util', () => ({
  listFirefliesTranscripts: listFirefliesTranscriptsMock,
}));

const connections = [
  {
    id: 'connection-1',
    providerName: 'fireflies',
    name: 'Sales Fireflies',
    handle: 'sales@example.com',
    visibility: 'workspace',
    userWorkspaceId: 'user-workspace-1',
    workspaceMemberId: null,
    accessToken: 'sales-access-token',
    scopes: ['meetings.read.user'],
    authFailedAt: null,
  },
  {
    id: 'connection-2',
    providerName: 'fireflies',
    name: 'Support Fireflies',
    handle: 'support@example.com',
    visibility: 'workspace',
    userWorkspaceId: 'user-workspace-2',
    workspaceMemberId: null,
    accessToken: 'support-access-token',
    scopes: ['meetings.read.user'],
    authFailedAt: null,
  },
] satisfies AppConnection[];

const buildCall = (id: string, date: string) => ({
  id,
  date,
  title: id,
  durationMinutes: 30,
  participants: [],
  hostEmail: null,
  transcriptUrl: null,
  meetingLink: null,
});

describe('listFirefliesTranscriptsAcrossConnections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('queries every connection, deduplicates shared calls, and applies a global limit', async () => {
    listFirefliesTranscriptsMock
      .mockResolvedValueOnce({
        ok: true,
        data: [
          buildCall('shared-call', '2026-08-20T10:00:00.000Z'),
          buildCall('sales-call', '2026-08-18T10:00:00.000Z'),
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        data: [
          buildCall('support-call', '2026-08-21T10:00:00.000Z'),
          buildCall('shared-call', '2026-08-20T10:00:00.000Z'),
        ],
      });

    const result = await listFirefliesTranscriptsAcrossConnections({
      connections,
      keyword: 'pricing',
      keywordScope: 'all',
      limit: 2,
    });

    expect(listFirefliesTranscriptsMock).toHaveBeenCalledTimes(2);
    expect(listFirefliesTranscriptsMock).toHaveBeenNthCalledWith(1, {
      accessToken: 'sales-access-token',
      keyword: 'pricing',
      keywordScope: 'all',
      participants: undefined,
      limit: 2,
    });
    expect(result).toEqual({
      calls: [
        buildCall('support-call', '2026-08-21T10:00:00.000Z'),
        buildCall('shared-call', '2026-08-20T10:00:00.000Z'),
      ],
      connectionErrors: [],
      successfulConnectionCount: 2,
    });
  });

  it('returns healthy account results alongside per-account failures', async () => {
    listFirefliesTranscriptsMock
      .mockResolvedValueOnce({
        ok: false,
        errorMessage: 'token expired',
      })
      .mockResolvedValueOnce({
        ok: true,
        data: [buildCall('support-call', '2026-08-21T10:00:00.000Z')],
      });

    const result = await listFirefliesTranscriptsAcrossConnections({
      connections,
      participants: ['person@example.com'],
      limit: 20,
    });

    expect(result).toEqual({
      calls: [buildCall('support-call', '2026-08-21T10:00:00.000Z')],
      connectionErrors: ['Sales Fireflies: token expired'],
      successfulConnectionCount: 1,
    });
  });
});
