import { isNonEmptyString } from '@sniptt/guards';
import { RestApiClient } from 'twenty-client-sdk/rest';
import { formatRecordReference } from 'twenty-shared/ai';

import { sanitizeInboxReferenceLabel } from '@/sdk/inbox/mentions/utils/sanitize-inbox-reference-label.util';

type WorkspaceMemberResponse = {
  data: {
    workspaceMember: {
      name: { firstName: string | null; lastName: string | null };
      userEmail: string;
    };
  };
};

export const inboxMention = async ({
  workspaceMemberId,
}: {
  workspaceMemberId: string;
}): Promise<string> => {
  const {
    data: { workspaceMember },
  } = await new RestApiClient().get<WorkspaceMemberResponse>(
    `/rest/workspaceMembers/${workspaceMemberId}`,
  );

  const fullName =
    `${workspaceMember.name.firstName ?? ''} ${workspaceMember.name.lastName ?? ''}`.trim();

  return formatRecordReference({
    objectNameSingular: 'workspaceMember',
    recordId: workspaceMemberId,
    displayName: sanitizeInboxReferenceLabel(
      isNonEmptyString(fullName) ? fullName : workspaceMember.userEmail,
    ),
  });
};
