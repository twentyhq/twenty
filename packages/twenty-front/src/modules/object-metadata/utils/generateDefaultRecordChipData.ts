import { type RecordChipData } from '@/object-record/record-field/ui/types/RecordChipData';
import { isFieldFullNameValue } from '@/object-record/record-field/ui/types/guards/isFieldFullNameValue';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

type GenerateDefaultRecordChipDataArgs = {
  record: ObjectRecord;
  objectNameSingular: string;
};
export const generateDefaultRecordChipData = ({
  objectNameSingular,
  record,
}: GenerateDefaultRecordChipDataArgs): RecordChipData => {
  const name = isFieldFullNameValue(record.name)
    ? `${record.name.firstName} ${record.name.lastName}`
    : (record.name ?? '');

  return {
    avatarType: 'rounded',
    avatarUrl: name,
    isLabelIdentifier: false,
    name,
    objectNameSingular,
    recordId: record.id,
  };
};
