import { isFieldFullNameValue } from '@/object-record/record-field/types/guards/isFieldFullNameValue';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export const generateDefaultRecordChipData = (record: ObjectRecord) => {
  const name = isFieldFullNameValue(record.name)
    ? record.name.firstName + ' ' + record.name.lastName
    : (record.name ?? '');

  return {
    name,
    avatarUrl: name,
    avatarType: 'rounded',
    linkToShowPage: false,
  };
};
