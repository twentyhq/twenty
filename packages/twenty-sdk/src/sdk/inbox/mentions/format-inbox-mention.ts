import { formatInboxRecordReference } from '@/sdk/inbox/mentions/format-inbox-record-reference';

export const formatInboxMention = ({
  workspaceMemberId,
  label,
}: {
  workspaceMemberId: string;
  label: string;
}): string =>
  formatInboxRecordReference({
    objectNameSingular: 'workspaceMember',
    recordId: workspaceMemberId,
    label,
  });
