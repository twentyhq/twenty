import { isFieldFullNameValue } from '@/object-record/record-field/types/guards/isFieldFullNameValue';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { v4 } from 'uuid';

export const generateDefaultRecordChipData = (
  {__typename, ...record}: ObjectRecord,
) => {
  const name = isFieldFullNameValue(record.name)
    ? `${record.name.firstName} ${record.name.lastName}`
    : (record.name ?? '');

  return {
    __typename,
    id: v4(),
    name,
    avatarUrl: name,
    avatarType: 'rounded',
    linkToShowPage: false,
  } satisfies ObjectRecord;
};
