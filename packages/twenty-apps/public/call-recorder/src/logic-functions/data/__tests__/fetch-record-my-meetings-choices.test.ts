import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CallRecorderRecordMyMeetingsChoice } from 'src/constants/call-recorder-record-my-meetings-choice';
import { CALL_RECORDER_RECORD_MY_MEETINGS_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-record-my-meetings-env-var-name';
import { fetchRecordMyMeetingsChoices } from 'src/logic-functions/data/fetch-record-my-meetings-choices.util';

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

const buildMember = ({
  workspaceMemberId,
  value,
}: {
  workspaceMemberId: string | null;
  value: string | null | undefined;
}) => ({
  workspaceMemberId,
  variables:
    value === undefined
      ? []
      : [{ key: CALL_RECORDER_RECORD_MY_MEETINGS_ENV_VAR_NAME, value }],
});

describe('fetchRecordMyMeetingsChoices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reads every member value with the application token', async () => {
    queryMock.mockResolvedValue({ myUserApplicationVariables: [] });

    await fetchRecordMyMeetingsChoices();

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

  it('maps each member to their choice and falls back to external meetings', async () => {
    queryMock.mockResolvedValue({
      myUserApplicationVariables: [
        buildMember({ workspaceMemberId: 'member-all', value: 'ALL_MEETINGS' }),
        buildMember({ workspaceMemberId: 'member-none', value: 'NONE' }),
        buildMember({
          workspaceMemberId: 'member-external',
          value: 'EXTERNAL_MEETINGS',
        }),
        buildMember({ workspaceMemberId: 'member-default', value: undefined }),
        buildMember({ workspaceMemberId: 'member-blank', value: '' }),
        buildMember({ workspaceMemberId: 'member-garbage', value: 'maybe' }),
        buildMember({ workspaceMemberId: null, value: 'NONE' }),
      ],
    });

    const result = await fetchRecordMyMeetingsChoices();

    expect([...result.entries()].sort()).toEqual([
      ['member-all', CallRecorderRecordMyMeetingsChoice.ALL_MEETINGS],
      ['member-blank', CallRecorderRecordMyMeetingsChoice.EXTERNAL_MEETINGS],
      ['member-default', CallRecorderRecordMyMeetingsChoice.EXTERNAL_MEETINGS],
      ['member-external', CallRecorderRecordMyMeetingsChoice.EXTERNAL_MEETINGS],
      ['member-garbage', CallRecorderRecordMyMeetingsChoice.EXTERNAL_MEETINGS],
      ['member-none', CallRecorderRecordMyMeetingsChoice.NONE],
    ]);
  });

  it('ignores other variables of the same member', async () => {
    queryMock.mockResolvedValue({
      myUserApplicationVariables: [
        {
          workspaceMemberId: 'member-1',
          variables: [
            { key: 'OTHER_VARIABLE', value: 'NONE' },
            {
              key: CALL_RECORDER_RECORD_MY_MEETINGS_ENV_VAR_NAME,
              value: 'ALL_MEETINGS',
            },
          ],
        },
      ],
    });

    const result = await fetchRecordMyMeetingsChoices();

    expect(result.get('member-1')).toBe(
      CallRecorderRecordMyMeetingsChoice.ALL_MEETINGS,
    );
  });
});
