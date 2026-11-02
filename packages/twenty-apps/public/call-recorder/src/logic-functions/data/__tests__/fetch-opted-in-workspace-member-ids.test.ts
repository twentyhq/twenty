import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CALL_RECORDER_RECORD_MY_MEETINGS_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-record-my-meetings-env-var-name';
import { fetchOptedInWorkspaceMemberIds } from 'src/logic-functions/data/fetch-opted-in-workspace-member-ids.util';

const queryMock = vi.hoisted(() => vi.fn());
const metadataApiClientConstructorMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/metadata', () => ({
  MetadataApiClient: class {
    constructor(options: unknown) {
      metadataApiClientConstructorMock(options);
    }

    query = queryMock;
  },
}));

const buildMember = (
  workspaceMemberId: string | null,
  value: string | null | undefined,
) => ({
  workspaceMemberId,
  variables:
    value === undefined
      ? []
      : [{ key: CALL_RECORDER_RECORD_MY_MEETINGS_ENV_VAR_NAME, value }],
});

describe('fetchOptedInWorkspaceMemberIds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reads every member value with the application token', async () => {
    queryMock.mockResolvedValue({ myUserApplicationVariables: [] });

    await fetchOptedInWorkspaceMemberIds();

    expect(metadataApiClientConstructorMock).toHaveBeenCalledWith(
      expect.objectContaining({ runAs: 'application' }),
    );
    expect(queryMock).toHaveBeenCalledWith({
      myUserApplicationVariables: {
        workspaceMemberId: true,
        variables: { key: true, value: true },
      },
    });
  });

  it('keeps members whose value is on, missing or unparseable and drops those set to off', async () => {
    queryMock.mockResolvedValue({
      myUserApplicationVariables: [
        buildMember('member-on', 'true'),
        buildMember('member-off', 'false'),
        buildMember('member-default', undefined),
        buildMember('member-blank', ''),
        buildMember('member-garbage', 'maybe'),
        buildMember(null, 'true'),
      ],
    });

    const result = await fetchOptedInWorkspaceMemberIds();

    expect([...result].sort()).toEqual([
      'member-blank',
      'member-default',
      'member-garbage',
      'member-on',
    ]);
  });

  it('ignores other variables of the same member', async () => {
    queryMock.mockResolvedValue({
      myUserApplicationVariables: [
        {
          workspaceMemberId: 'member-1',
          variables: [
            { key: 'OTHER_VARIABLE', value: 'false' },
            { key: CALL_RECORDER_RECORD_MY_MEETINGS_ENV_VAR_NAME, value: 'on' },
          ],
        },
      ],
    });

    const result = await fetchOptedInWorkspaceMemberIds();

    expect(result.has('member-1')).toBe(true);
  });
});
