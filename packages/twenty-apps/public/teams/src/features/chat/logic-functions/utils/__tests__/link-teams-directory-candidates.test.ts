import { beforeEach, describe, expect, it, vi } from 'vitest';

import { linkTeamsDirectoryCandidates } from 'src/features/chat/logic-functions/utils/link-teams-directory-candidates';

const { createTeamsUserLinksMock, createTeamsUserLinkMock } = vi.hoisted(
  () => ({
    createTeamsUserLinksMock: vi.fn(),
    createTeamsUserLinkMock: vi.fn(),
  }),
);

vi.mock(
  'src/features/chat/logic-functions/data/create-teams-user-links',
  () => ({
    createTeamsUserLinks: createTeamsUserLinksMock,
  }),
);

vi.mock(
  'src/features/chat/logic-functions/data/create-teams-user-link',
  () => ({
    createTeamsUserLink: createTeamsUserLinkMock,
  }),
);

const CLIENT = { mutation: vi.fn() };
const TENANT_ID = 'tenant-1';

const buildCandidate = (index: number) => ({
  teamsUserAadObjectId: `aad-${index}`,
  workspaceMemberId: `member-${index}`,
  displayName: index % 2 === 0 ? `User ${index}` : undefined,
});

describe('linkTeamsDirectoryCandidates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    createTeamsUserLinksMock.mockResolvedValue(undefined);
    createTeamsUserLinkMock.mockResolvedValue(undefined);
  });

  it('creates AUTO links in bulk, naming unnamed users after their id', async () => {
    const outcome = await linkTeamsDirectoryCandidates({
      client: CLIENT,
      candidates: [buildCandidate(1), buildCandidate(2)],
      teamsTenantId: TENANT_ID,
    });

    expect(outcome).toEqual({ linkedCount: 2, failedCount: 0 });
    expect(createTeamsUserLinksMock).toHaveBeenCalledTimes(1);
    expect(createTeamsUserLinksMock).toHaveBeenCalledWith({
      client: CLIENT,
      drafts: [
        {
          teamsTenantId: TENANT_ID,
          teamsUserAadObjectId: 'aad-1',
          workspaceMemberId: 'member-1',
          name: 'aad-1',
          source: 'AUTO',
        },
        {
          teamsTenantId: TENANT_ID,
          teamsUserAadObjectId: 'aad-2',
          workspaceMemberId: 'member-2',
          name: 'User 2',
          source: 'AUTO',
        },
      ],
    });
    expect(createTeamsUserLinkMock).not.toHaveBeenCalled();
  });

  it('retries a failed batch one by one, counting duplicates as linked', async () => {
    createTeamsUserLinksMock.mockRejectedValue(new Error('batch failed'));
    createTeamsUserLinkMock
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('Duplicate key value'))
      .mockRejectedValueOnce(new Error('network'));

    const outcome = await linkTeamsDirectoryCandidates({
      client: CLIENT,
      candidates: [buildCandidate(1), buildCandidate(2), buildCandidate(3)],
      teamsTenantId: TENANT_ID,
    });

    expect(outcome).toEqual({ linkedCount: 2, failedCount: 1 });
    expect(createTeamsUserLinkMock).toHaveBeenCalledTimes(3);
    expect(createTeamsUserLinkMock).toHaveBeenCalledWith({
      client: CLIENT,
      teamsTenantId: TENANT_ID,
      teamsUserAadObjectId: 'aad-1',
      workspaceMemberId: 'member-1',
      name: 'aad-1',
      source: 'AUTO',
    });
  });

  it('splits candidates into batches of 200 and stops retrying one by one past the budget', async () => {
    createTeamsUserLinksMock.mockRejectedValue(new Error('batch failed'));

    const outcome = await linkTeamsDirectoryCandidates({
      client: CLIENT,
      candidates: Array.from({ length: 450 }, (_, index) =>
        buildCandidate(index),
      ),
      teamsTenantId: TENANT_ID,
    });

    expect(createTeamsUserLinksMock).toHaveBeenCalledTimes(3);
    expect(createTeamsUserLinkMock).toHaveBeenCalledTimes(200);
    expect(outcome).toEqual({ linkedCount: 200, failedCount: 250 });
  });
});
