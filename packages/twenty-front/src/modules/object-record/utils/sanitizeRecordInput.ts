import { isString } from '@sniptt/guards';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isFieldRelationToOneValue } from '@/object-record/record-field/types/guards/isFieldRelationToOneValue';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldMetadataType } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';
import { getUrlHostName } from '~/utils/url/getUrlHostName';

export const sanitizeRecordInput = ({
  objectMetadataItem,
  recordInput,
}: {
  objectMetadataItem: ObjectMetadataItem;
  recordInput: Partial<ObjectRecord>;
}) => {
  const filteredResultRecord = Object.fromEntries(
    Object.entries(recordInput)
      .map<[string, unknown] | undefined>(([fieldName, fieldValue]) => {
        const fieldMetadataItem = objectMetadataItem.fields.find(
          (field) => field.name === fieldName,
        );

        if (!fieldMetadataItem) return undefined;

        if (!fieldMetadataItem.isNullable && fieldValue == null) {
          return undefined;
        }

        if (
          fieldMetadataItem.type === FieldMetadataType.Relation &&
          isFieldRelationToOneValue(fieldValue)
        ) {
          const relationIdFieldName = `${fieldMetadataItem.name}Id`;
          const relationIdFieldMetadataItem = objectMetadataItem.fields.find(
            (field) => field.name === relationIdFieldName,
          );

          return relationIdFieldMetadataItem && fieldValue?.id
            ? [relationIdFieldName, fieldValue?.id ?? null]
            : undefined;
        }

        return [fieldName, fieldValue];
      })
      .filter(isDefined),
  );
  if (
    !(
      isDefined(filteredResultRecord.domainName) &&
      isString(filteredResultRecord.domainName)
    )
  )
    return filteredResultRecord;
  return {
    ...filteredResultRecord,
    domainName: getUrlHostName(filteredResultRecord.domainName as string),
  };
};
