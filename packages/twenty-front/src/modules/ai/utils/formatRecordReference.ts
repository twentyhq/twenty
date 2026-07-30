import { formatChatReference } from '@/ai/utils/formatChatReference';

export const formatRecordReference = ({
  objectNameSingular,
  recordId,
  displayName,
}: {
  objectNameSingular: string;
  recordId: string;
  displayName: string;
}): string =>
  formatChatReference({
    kind: 'record',
    objectNameSingular,
    recordId,
    displayName,
  });
