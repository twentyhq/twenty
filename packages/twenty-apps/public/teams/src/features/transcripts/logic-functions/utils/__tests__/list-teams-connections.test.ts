import { beforeEach, describe, expect, it, vi } from 'vitest';

import { listTeamsConnections } from 'src/features/transcripts/logic-functions/utils/list-teams-connections';

const { listConnectionsMock } = vi.hoisted(() => ({
  listConnectionsMock: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  listConnections: listConnectionsMock,
}));

describe('listTeamsConnections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should list workspace-shared and personal Microsoft Teams connections', async () => {
    listConnectionsMock.mockResolvedValue([
      { id: 'shared-connection', providerName: 'microsoft-teams' },
      { id: 'personal-connection', providerName: 'microsoft-teams-user' },
      { id: 'other-connection', providerName: 'other-provider' },
    ]);

    await expect(listTeamsConnections()).resolves.toEqual([
      { id: 'shared-connection', providerName: 'microsoft-teams' },
      { id: 'personal-connection', providerName: 'microsoft-teams-user' },
    ]);
    expect(listConnectionsMock).toHaveBeenCalledExactlyOnceWith();
  });
});
