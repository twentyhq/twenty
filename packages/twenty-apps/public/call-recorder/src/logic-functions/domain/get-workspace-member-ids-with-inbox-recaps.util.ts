import { CALL_RECORDER_MEMBER_INBOX_RECAPS_ENABLED_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-member-inbox-recaps-enabled-env-var-name';
import { DEFAULT_MEMBER_INBOX_RECAPS_ENABLED } from 'src/logic-functions/constants/default-member-inbox-recaps-enabled';
import { type MemberApplicationVariables } from 'src/logic-functions/types/member-application-variables.type';
import { parseBooleanApplicationVariableValue } from 'src/logic-functions/utils/parse-boolean-application-variable-value.util';

export const getWorkspaceMemberIdsWithInboxRecaps = (
  memberApplicationVariables: MemberApplicationVariables[],
): Set<string> =>
  new Set(
    memberApplicationVariables
      .filter(({ variables }) =>
        parseBooleanApplicationVariableValue({
          rawValue: variables.find(
            ({ key }) =>
              key === CALL_RECORDER_MEMBER_INBOX_RECAPS_ENABLED_ENV_VAR_NAME,
          )?.value,
          defaultValue: DEFAULT_MEMBER_INBOX_RECAPS_ENABLED,
        }),
      )
      .map(({ workspaceMemberId }) => workspaceMemberId),
  );
