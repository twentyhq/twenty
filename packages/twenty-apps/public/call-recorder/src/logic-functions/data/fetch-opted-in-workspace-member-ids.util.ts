import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { CALL_RECORDER_RECORD_MY_MEETINGS_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-record-my-meetings-env-var-name';
import { DEFAULT_CALL_RECORDER_RECORD_MY_MEETINGS } from 'src/logic-functions/constants/default-call-recorder-record-my-meetings';
import { fetchWithRateLimitRetry } from 'src/logic-functions/utils/fetch-with-rate-limit-retry.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';
import { parseBooleanApplicationVariableValue } from 'src/logic-functions/utils/parse-boolean-application-variable-value.util';

type WorkspaceMemberApplicationVariablesNode = {
  workspaceMemberId?: string | null;
  variables?: Array<{ key?: string | null; value?: string | null }> | null;
};

// User-scoped values are absent from process.env in cron and sweep runs, and a
// database event run carries the editor's values, not the attendees', so the
// opted-in set is always read for every member.
export const fetchOptedInWorkspaceMemberIds = async (): Promise<Set<string>> => {
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

  const memberNodes = (queryResult.myUserApplicationVariables ??
    []) as WorkspaceMemberApplicationVariablesNode[];
  const optedInWorkspaceMemberIds = new Set<string>();

  for (const memberNode of memberNodes) {
    if (!isNonEmptyString(memberNode.workspaceMemberId)) {
      continue;
    }

    const recordMyMeetingsVariable = memberNode.variables?.find(
      (variable) => variable.key === CALL_RECORDER_RECORD_MY_MEETINGS_ENV_VAR_NAME,
    );
    const isRecordingMeetings = parseBooleanApplicationVariableValue({
      rawValue: recordMyMeetingsVariable?.value ?? undefined,
      defaultValue: DEFAULT_CALL_RECORDER_RECORD_MY_MEETINGS,
    });

    if (isRecordingMeetings) {
      optedInWorkspaceMemberIds.add(memberNode.workspaceMemberId);
    }
  }

  return optedInWorkspaceMemberIds;
};
