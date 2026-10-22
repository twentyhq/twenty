import { beforeEach, describe, expect, it, vi } from 'vitest';

import { teamsGenerateCallSummariesHandler } from 'src/features/transcripts/logic-functions/teams-generate-call-summaries';
import { findTeamsCallRecordingIdsOrThrow } from 'src/features/transcripts/logic-functions/utils/find-teams-call-recording-ids-or-throw';
import { regenerateTeamsCallSummaries } from 'src/features/transcripts/logic-functions/utils/regenerate-teams-call-summaries';

vi.mock('twenty-client-sdk/core', () => ({ CoreApiClient: vi.fn() }));

vi.mock(
  'src/features/transcripts/logic-functions/utils/is-teams-transcript-summary-enabled',
  () => ({ isTeamsTranscriptSummaryEnabled: () => true }),
);

vi.mock(
  'src/features/transcripts/logic-functions/utils/find-teams-call-recording-ids-or-throw',
  () => ({ findTeamsCallRecordingIdsOrThrow: vi.fn() }),
);

vi.mock(
  'src/features/transcripts/logic-functions/utils/regenerate-teams-call-summaries',
  () => ({ regenerateTeamsCallSummaries: vi.fn() }),
);

const buildCallRecordingIds = (count: number) =>
  Array.from({ length: count }, (_, index) => `recording-${index}`);

const buildRoutePayload = (callRecordingIds: string[]) => ({
  headers: {},
  queryStringParameters: {},
  pathParameters: {},
  body: { callRecordingIds },
  isBase64Encoded: false,
  requestContext: { http: { method: 'POST', path: '/' } },
  userWorkspaceId: null,
});

describe('teamsGenerateCallSummariesHandler', () => {
  beforeEach(() => {
    vi.mocked(findTeamsCallRecordingIdsOrThrow).mockReset();
    vi.mocked(regenerateTeamsCallSummaries).mockReset();
    vi.mocked(regenerateTeamsCallSummaries).mockResolvedValue({
      summarizedCallRecordingIds: [],
      unavailableCallRecordingIds: [],
      failedCallRecordingIds: [],
      skippedCallRecordingIds: [],
    });
  });

  it('should regenerate up to 20 Teams call recordings', async () => {
    const callRecordingIds = buildCallRecordingIds(20);

    vi.mocked(findTeamsCallRecordingIdsOrThrow).mockResolvedValue(
      callRecordingIds,
    );

    await expect(
      teamsGenerateCallSummariesHandler(buildRoutePayload(callRecordingIds)),
    ).resolves.toMatchObject({ outcome: 'processed' });
    expect(regenerateTeamsCallSummaries).toHaveBeenCalledWith(
      expect.objectContaining({ callRecordingIds }),
    );
  });

  it('should refuse more than 20 Teams call recordings without running the agent', async () => {
    const callRecordingIds = buildCallRecordingIds(21);

    vi.mocked(findTeamsCallRecordingIdsOrThrow).mockResolvedValue(
      callRecordingIds,
    );

    await expect(
      teamsGenerateCallSummariesHandler(buildRoutePayload(callRecordingIds)),
    ).resolves.toEqual({ outcome: 'too-many-call-recordings' });
    expect(regenerateTeamsCallSummaries).not.toHaveBeenCalled();
  });
});
