import { isString } from '@sniptt/guards';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isFieldRelationValue } from '@/object-record/record-field/types/guards/isFieldRelationValue';
import { sanitizeLink } from '@/object-record/utils/sanitizeLinkRecordInput';
import { FieldMetadataType } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

export const sanitizeRecordInput = ({
  objectMetadataItem,
  recordInput,
}: {
  objectMetadataItem: ObjectMetadataItem;
  recordInput: Record<string, unknown>;
}) => {
  const filteredResultRecord = Object.fromEntries(
    Object.entries(recordInput)
      .map<[string, unknown] | undefined>(([fieldName, fieldValue]) => {
        const fieldMetadataItem = objectMetadataItem.fields.find(
          (field) => field.name === fieldName,
        );

        if (!fieldMetadataItem) return undefined;

        if (
          fieldMetadataItem.type === FieldMetadataType.Relation &&
          isFieldRelationValue(fieldValue)
        ) {
          const relationIdFieldName = `${fieldMetadataItem.name}Id`;
          const relationIdFieldMetadataItem = objectMetadataItem.fields.find(
            (field) => field.name === relationIdFieldName,
          );

          return relationIdFieldMetadataItem
            ? [relationIdFieldName, fieldValue?.id ?? null]
            : undefined;
        }

        return [fieldName, fieldValue];
      })
      .filter(isDefined),
  );
  if (
    objectMetadataItem.nameSingular !== CoreObjectNameSingular.Company ||
    !isString(filteredResultRecord.domainName)
  )
    return filteredResultRecord;

  return {
    ...filteredResultRecord,
    domainName: sanitizeLink(filteredResultRecord.domainName),
  };
};
