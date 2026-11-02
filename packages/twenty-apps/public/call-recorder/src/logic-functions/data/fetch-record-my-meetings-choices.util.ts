import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { CallRecorderRecordMyMeetingsChoice } from 'src/constants/call-recorder-record-my-meetings-choice';
import { CALL_RECORDER_RECORD_MY_MEETINGS_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-record-my-meetings-env-var-name';
import { DEFAULT_CALL_RECORDER_RECORD_MY_MEETINGS } from 'src/logic-functions/constants/default-call-recorder-record-my-meetings';
import { fetchWithRateLimitRetry } from 'src/logic-functions/utils/fetch-with-rate-limit-retry.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

type WorkspaceMemberApplicationVariablesNode = {
  workspaceMemberId?: string | null;
  variables?: Array<{ key?: string | null; value?: string | null }> | null;
};

const RECORD_MY_MEETINGS_CHOICES = new Set<string>(
  Object.values(CallRecorderRecordMyMeetingsChoice),
);

const isRecordMyMeetingsChoice = (
  value: string | null | undefined,
): value is CallRecorderRecordMyMeetingsChoice =>
  isNonEmptyString(value) && RECORD_MY_MEETINGS_CHOICES.has(value);

// Cron and sweep runs get no member values in process.env and database event runs get the editor's, so every member is read here.
export const fetchRecordMyMeetingsChoices = async (): Promise<
  Map<string, CallRecorderRecordMyMeetingsChoice>
> => {
  const client = new MetadataApiClient({
    runAs: 'application',
    fetch: fetchWithRateLimitRetry,
  });

  const queryResult = await client.query({
    myUserApplicationVariables: {
      workspaceMemberId: true,
      variables: {
        key: true,
        value: true,
      },
    },
  });

  const memberNodes: WorkspaceMemberApplicationVariablesNode[] =
    queryResult.myUserApplicationVariables ?? [];
  const choicesByWorkspaceMemberId = new Map<
    string,
    CallRecorderRecordMyMeetingsChoice
  >();

  for (const memberNode of memberNodes) {
    if (!isNonEmptyString(memberNode.workspaceMemberId)) {
      continue;
    }

    const value = memberNode.variables?.find(
      (variable) =>
        variable.key === CALL_RECORDER_RECORD_MY_MEETINGS_ENV_VAR_NAME,
    )?.value;

    choicesByWorkspaceMemberId.set(
      memberNode.workspaceMemberId,
      isRecordMyMeetingsChoice(value)
        ? value
        : DEFAULT_CALL_RECORDER_RECORD_MY_MEETINGS,
    );
  }

  return choicesByWorkspaceMemberId;
};
