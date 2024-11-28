import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isFieldRelation } from '@/object-record/record-field/types/guards/isFieldRelation';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from '~/utils/isDefined';

export const addDefaultValueRecordInput = ({
  objectMetadataItem,
  recordInput,
}: {
  objectMetadataItem: ObjectMetadataItem;
  recordInput: Partial<ObjectRecord>;
}) => {
  for (const fieldMetadataItem of objectMetadataItem.fields) {
    if (isDefined(recordInput[fieldMetadataItem.name])) {
      continue;
    }

    if (isFieldRelation(fieldMetadataItem)) {
      continue;
    }

    const defaultValue = fieldMetadataItem.defaultValue;

    if (!isDefined(defaultValue)) {
      continue;
    }

    if (fieldMetadataItem.name === 'createdBy') {
      continue;
    }

    if (typeof defaultValue === 'string') {
      if (/^'.*'$/.test(defaultValue)) {
        recordInput[fieldMetadataItem.name] = defaultValue.slice(1, -1);
      }
    } else if (Array.isArray(defaultValue)) {
      recordInput[fieldMetadataItem.name] = [...defaultValue];
    } else if (typeof defaultValue === 'object' && defaultValue !== null) {
      recordInput[fieldMetadataItem.name] = { ...defaultValue };
    } else {
      recordInput[fieldMetadataItem.name] = defaultValue;
    }
  }

  return recordInput;
};
