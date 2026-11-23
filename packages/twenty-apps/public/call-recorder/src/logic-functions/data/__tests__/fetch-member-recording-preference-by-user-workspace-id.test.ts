import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchMemberRecordingPreferenceByUserWorkspaceId } from 'src/logic-functions/data/fetch-member-recording-preference-by-user-workspace-id.util';

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

const buildMemberVariables = ({
  userWorkspaceId,
  value,
}: {
  userWorkspaceId: string;
  value: string;
}) => ({
  userWorkspaceId,
  variables: [
    { key: 'ANOTHER_MEMBER_VARIABLE', value: 'ALL' },
    { key: 'CALL_RECORDER_MEMBER_RECORDING_PREFERENCE', value },
  ],
});

describe('fetchMemberRecordingPreferenceByUserWorkspaceId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps each member to the meetings they chose to record', async () => {
    metadataQueryMock.mockResolvedValue({
      myUserApplicationVariables: [
        buildMemberVariables({
          userWorkspaceId: 'user-workspace-1',
          value: 'ALL',
        }),
        buildMemberVariables({
          userWorkspaceId: 'user-workspace-2',
          value: 'NONE',
        }),
      ],
    });

    expect(await fetchMemberRecordingPreferenceByUserWorkspaceId()).toEqual(
      new Map([
        ['user-workspace-1', 'ALL'],
        ['user-workspace-2', 'NONE'],
      ]),
    );
  });

  it('reads a saved value outside the options as recording none', async () => {
    metadataQueryMock.mockResolvedValue({
      myUserApplicationVariables: [
        buildMemberVariables({
          userWorkspaceId: 'user-workspace-1',
          value: 'EVERYTHING',
        }),
      ],
    });

    expect(await fetchMemberRecordingPreferenceByUserWorkspaceId()).toEqual(
      new Map([['user-workspace-1', 'NONE']]),
    );
  });

  it('reads the preferences of every member as the application', async () => {
    metadataQueryMock.mockResolvedValue({ myUserApplicationVariables: [] });

    await fetchMemberRecordingPreferenceByUserWorkspaceId();

    expect(metadataClientOptionsMock).toHaveBeenCalledWith(
      expect.objectContaining({ runAs: 'application' }),
    );
  });
});
