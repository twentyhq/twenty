import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type TeamsDirectoryMatchCandidate } from 'src/features/chat/logic-functions/types/teams-directory-match.type';
import { matchTeamsDirectoryByEmail } from 'src/features/chat/logic-functions/utils/match-teams-directory-by-email';

const {
  coreApiClientMock,
  listLinkedTeamsUserAadObjectIdsMock,
  collectGraphUsersMock,
  findWorkspaceMemberIdsByEmailsMock,
  linkTeamsDirectoryCandidatesMock,
  saveTeamsDirectoryMatchRunOutcomeMock,
} = vi.hoisted(() => ({
  coreApiClientMock: vi.fn(function () {
    return {};
  }),
  listLinkedTeamsUserAadObjectIdsMock: vi.fn(),
  collectGraphUsersMock: vi.fn(),
  findWorkspaceMemberIdsByEmailsMock: vi.fn(),
  linkTeamsDirectoryCandidatesMock: vi.fn(),
  saveTeamsDirectoryMatchRunOutcomeMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: coreApiClientMock,
}));

vi.mock(
  'src/features/chat/logic-functions/data/list-linked-teams-user-aad-object-ids',
  () => ({
    listLinkedTeamsUserAadObjectIdsOrThrow: listLinkedTeamsUserAadObjectIdsMock,
  }),
);

vi.mock('src/features/chat/logic-functions/utils/collect-graph-users', () => ({
  collectGraphUsers: collectGraphUsersMock,
}));

vi.mock(
  'src/features/chat/logic-functions/data/find-workspace-member-ids-by-emails',
  () => ({
    findWorkspaceMemberIdsByEmails: findWorkspaceMemberIdsByEmailsMock,
  }),
);

vi.mock(
  'src/features/chat/logic-functions/utils/link-teams-directory-candidates',
  () => ({ linkTeamsDirectoryCandidates: linkTeamsDirectoryCandidatesMock }),
);

vi.mock(
  'src/features/chat/logic-functions/utils/save-teams-directory-match-run-outcome',
  () => ({
    saveTeamsDirectoryMatchRunOutcome: saveTeamsDirectoryMatchRunOutcomeMock,
  }),
);

const TENANT_ID = 'tenant-1';
const ADA = { id: 'aad-ada', displayName: 'Ada', mail: 'Ada@twenty.com' };
const BOB = { id: 'aad-bob', displayName: 'Bob', mail: 'bob@twenty.com' };
const LINKED = { id: 'aad-linked', mail: 'linked@twenty.com' };
const GUEST = {
  id: 'aad-guest',
  mail: 'guest@partner.com',
  userPrincipalName: 'guest_partner.com#EXT#@twenty.onmicrosoft.com',
};

const run = () =>
  matchTeamsDirectoryByEmail({
    accessToken: 'token',
    teamsTenantId: TENANT_ID,
  });

describe('matchTeamsDirectoryByEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listLinkedTeamsUserAadObjectIdsMock.mockResolvedValue(
      new Set(['aad-linked']),
    );
    collectGraphUsersMock.mockResolvedValue({
      users: [ADA, BOB, LINKED, GUEST],
      isTruncated: false,
    });
    findWorkspaceMemberIdsByEmailsMock.mockResolvedValue({
      workspaceMemberIdByEmail: new Map([['ada@twenty.com', 'member-ada']]),
      ambiguousEmailCount: 1,
    });
    linkTeamsDirectoryCandidatesMock.mockImplementation(
      async ({
        candidates,
      }: {
        candidates: TeamsDirectoryMatchCandidate[];
      }) => ({
        linkedCount: candidates.length,
        failedCount: 0,
      }),
    );
  });

  it('links directory users whose email matches a member and records a successful run', async () => {
    const summary = await run();

    expect(collectGraphUsersMock).toHaveBeenCalledWith({
      accessToken: 'token',
      url: 'users?$select=id,displayName,mail,userPrincipalName&$top=999',
      maxPages: 10,
    });
    expect(listLinkedTeamsUserAadObjectIdsMock).toHaveBeenCalledWith({
      client: expect.anything(),
      teamsTenantId: TENANT_ID,
    });
    expect(findWorkspaceMemberIdsByEmailsMock).toHaveBeenCalledWith({
      client: expect.anything(),
      emails: ['Ada@twenty.com', 'bob@twenty.com', 'linked@twenty.com'],
    });
    expect(linkTeamsDirectoryCandidatesMock).toHaveBeenCalledWith({
      client: expect.anything(),
      teamsTenantId: TENANT_ID,
      candidates: [
        {
          teamsUserAadObjectId: 'aad-ada',
          workspaceMemberId: 'member-ada',
          displayName: 'Ada',
        },
      ],
    });
    expect(summary).toEqual({
      linkedCount: 1,
      alreadyLinkedCount: 1,
      unmatchedCount: 2,
      ambiguousEmailCount: 1,
      failedCount: 0,
      isDirectoryTruncated: false,
    });
    expect(saveTeamsDirectoryMatchRunOutcomeMock).toHaveBeenCalledTimes(2);
    expect(saveTeamsDirectoryMatchRunOutcomeMock).toHaveBeenNthCalledWith(1, {
      isSuccessful: false,
      errorMessage: 'The directory match was interrupted before it finished.',
    });
    expect(saveTeamsDirectoryMatchRunOutcomeMock).toHaveBeenNthCalledWith(2, {
      isSuccessful: true,
    });
    expect(
      saveTeamsDirectoryMatchRunOutcomeMock.mock.invocationCallOrder[0],
    ).toBeLessThan(collectGraphUsersMock.mock.invocationCallOrder[0]);
  });

  it('records a failed run when some candidates could not be linked', async () => {
    linkTeamsDirectoryCandidatesMock.mockResolvedValue({
      linkedCount: 0,
      failedCount: 1,
    });

    const summary = await run();

    expect(summary.failedCount).toBe(1);
    expect(saveTeamsDirectoryMatchRunOutcomeMock).toHaveBeenLastCalledWith({
      isSuccessful: false,
    });
  });

  it('records the error and rethrows when the directory cannot be read', async () => {
    collectGraphUsersMock.mockRejectedValue(new Error('graph down'));

    await expect(run()).rejects.toThrow('graph down');
    expect(saveTeamsDirectoryMatchRunOutcomeMock).toHaveBeenLastCalledWith({
      isSuccessful: false,
      errorMessage: 'graph down',
    });
    expect(linkTeamsDirectoryCandidatesMock).not.toHaveBeenCalled();
  });
});
