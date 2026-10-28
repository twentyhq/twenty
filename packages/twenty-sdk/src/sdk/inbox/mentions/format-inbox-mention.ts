import { WORKSPACE_MEMBER_OBJECT_NAME_SINGULAR } from '@/sdk/inbox/mentions/constants/workspace-member-object-name-singular';
import { formatInboxRecordReference } from '@/sdk/inbox/mentions/format-inbox-record-reference';

export const formatInboxMention = ({
  workspaceMemberId,
  label,
}: {
  workspaceMemberId: string;
  label: string;
}): string =>
  formatInboxRecordReference({
    objectNameSingular: WORKSPACE_MEMBER_OBJECT_NAME_SINGULAR,
    recordId: workspaceMemberId,
    label,
  });
