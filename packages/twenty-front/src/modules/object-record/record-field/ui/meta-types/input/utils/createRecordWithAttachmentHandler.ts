import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { computeRecordAttachmentRetryInput } from '@/object-record/record-field/ui/meta-types/input/utils/computeRecordAttachmentRetryInput';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const createRecordWithAttachmentHandler = ({
  createRecord,
  updateRecord,
  attachRecord,
  fieldMetadataItems,
}: {
  createRecord: (recordInput: Partial<ObjectRecord>) => Promise<ObjectRecord>;
  updateRecord: (params: {
    recordId: string;
    recordInput: Partial<ObjectRecord>;
  }) => Promise<void>;
  attachRecord?: (recordId: string) => Promise<void>;
  fieldMetadataItems: Pick<
    FieldMetadataItem,
    'name' | 'type' | 'morphRelations'
  >[];
}) => {
  let recordAwaitingAttachment:
    | { record: ObjectRecord; recordInput: Partial<ObjectRecord> }
    | undefined;

  const saveRecord = async (recordInput: Partial<ObjectRecord>) => {
    if (!isDefined(recordAwaitingAttachment)) {
      return createRecord(recordInput);
    }

    const { record, recordInput: previousRecordInput } =
      recordAwaitingAttachment;

    if (isDeeplyEqual(recordInput, previousRecordInput)) {
      return record;
    }

    const updateRecordInput = computeRecordAttachmentRetryInput({
      fieldMetadataItems,
      previousRecordInput,
      recordInput,
    });

    await updateRecord({ recordId: record.id, recordInput: updateRecordInput });

    return { ...record, ...updateRecordInput };
  };

  return async (draftRecord: Partial<ObjectRecord>) => {
    const recordInput = removePropertiesFromRecord(draftRecord, ['id']);
    const record = await saveRecord(recordInput);

    if (isDefined(attachRecord)) {
      recordAwaitingAttachment = { record, recordInput };
      await attachRecord(record.id);
      recordAwaitingAttachment = undefined;
    }

    return record;
  };
};
