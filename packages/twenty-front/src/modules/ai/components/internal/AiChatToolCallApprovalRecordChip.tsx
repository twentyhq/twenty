import { RecordChip } from '@/object-record/components/RecordChip';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { isDefined } from 'twenty-shared/utils';

type AiChatToolCallApprovalRecordChipProps = {
  objectNameSingular: string;
  recordId: string;
};

export const AiChatToolCallApprovalRecordChip = ({
  objectNameSingular,
  recordId,
}: AiChatToolCallApprovalRecordChipProps) => {
  const { record } = useFindOneRecord({
    objectNameSingular,
    objectRecordId: recordId,
  });

  if (!isDefined(record)) {
    return null;
  }

  return <RecordChip objectNameSingular={objectNameSingular} record={record} />;
};
