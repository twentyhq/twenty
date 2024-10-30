import { isString } from '@sniptt/guards';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { RelationDefinitionType } from '~/generated-metadata/graphql';
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
          fieldMetadataItem.relationDefinition?.direction ===
            RelationDefinitionType.ManyToOne
        ) {
          const relationIdFieldName = `${fieldMetadataItem.name}Id`;
          const relationIdFieldMetadataItem = objectMetadataItem.fields.find(
            (field) => field.name === relationIdFieldName,
          );

          return relationIdFieldMetadataItem
            ? [relationIdFieldName, fieldValue?.id ?? null]
            : undefined;
        }

        if (
          fieldMetadataItem.type === FieldMetadataType.Relation &&
          fieldMetadataItem.relationDefinition?.direction ===
            RelationDefinitionType.OneToMany
        ) {
          return undefined;
        }

        // Todo: we should check that the fieldValue is a valid value
        // (e.g. a string for a string field, following the right composite structure for composite fields)
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
