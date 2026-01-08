import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';

import { type RecordGqlOperationOrderBy } from '@/object-record/graphql/types/RecordGqlOperationOrderBy';
import {
  type FieldEmailsValue,
  type FieldLinksValue,
  type FieldPhonesValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { type OrderBy } from '@/types/OrderBy';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const getOrderByForFieldMetadataType = (
  field: Pick<FieldMetadataItem, 'id' | 'name' | 'type'>,
  direction: OrderBy | null | undefined,
): RecordGqlOperationOrderBy => {
  switch (field.type) {
    case FieldMetadataType.FULL_NAME:
      return [
        {
          [field.name]: {
            firstName: direction ?? 'AscNullsLast',
            lastName: direction ?? 'AscNullsLast',
          },
        },
      ];
    case FieldMetadataType.CURRENCY:
      return [
        {
          [field.name]: {
            amountMicros: direction ?? 'AscNullsLast',
          },
        },
      ];
    case FieldMetadataType.ACTOR:
      return [
        {
          [field.name]: {
            name: direction ?? 'AscNullsLast',
          },
        },
      ];
    case FieldMetadataType.LINKS:
      return [
        {
          [field.name]: {
            primaryLinkUrl: direction ?? 'AscNullsLast',
          } satisfies { [key in keyof FieldLinksValue]?: OrderBy },
        },
      ];
    case FieldMetadataType.EMAILS:
      return [
        {
          [field.name]: {
            primaryEmail: direction ?? 'AscNullsLast',
          } satisfies { [key in keyof FieldEmailsValue]?: OrderBy },
        },
      ];
    case FieldMetadataType.PHONES:
      return [
        {
          [field.name]: {
            primaryPhoneNumber: direction ?? 'AscNullsLast',
          } satisfies { [key in keyof FieldPhonesValue]?: OrderBy },
        },
      ];
    default:
      return [
        {
          [field.name]: direction ?? 'AscNullsLast',
        },
      ];
  }
};

export const getOrderByForRelationField = (
  field: FieldMetadataItem,
  relatedObjectMetadataItem: Pick<
    ObjectMetadataItem,
    'fields' | 'labelIdentifierFieldMetadataId'
  >,
  direction: OrderBy,
): RecordGqlOperationOrderBy => {
  const labelIdentifierField = getLabelIdentifierFieldMetadataItem(
    relatedObjectMetadataItem,
  );

  if (!labelIdentifierField) {
    // Fallback: sort by FK (less useful but safe)
    return [{ [`${field.name}Id`]: direction }];
  }

  // Get the orderBy structure for the label identifier field type
  // This returns the full nested structure, e.g.:
  // - TEXT field 'name': [{ name: 'AscNullsLast' }]
  // - FULL_NAME field 'name': [{ name: { firstName: 'AscNullsLast', lastName: 'AscNullsLast' } }]
  const labelFieldOrderBy = getOrderByForFieldMetadataType(
    labelIdentifierField,
    direction,
  );

  // Wrap the entire label field orderBy in the relation field name
  // Result: { company: { name: 'AscNullsLast' } }
  // or: { company: { name: { firstName: 'AscNullsLast', lastName: 'AscNullsLast' } } }
  return [{ [field.name]: labelFieldOrderBy[0] }];
};
