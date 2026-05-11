import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { resolveAddressSortSubField } from '@/object-metadata/utils/resolveAddressSortSubField';
import { resolveFullNameSortSubField } from '@/object-metadata/utils/resolveFullNameSortSubField';

import {
  type FieldEmailsValue,
  type FieldLinksValue,
  type FieldPhonesValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { ALLOWED_FULL_NAME_SORT_SUBFIELDS } from 'twenty-shared/constants';
import {
  type OrderBy,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const getOrderByForFieldMetadataType = (
  field: Pick<FieldMetadataItem, 'id' | 'name' | 'type' | 'settings'>,
  direction: OrderBy | null | undefined,
  subFieldName?: string | null,
): RecordGqlOperationOrderBy => {
  switch (field.type) {
    case FieldMetadataType.FULL_NAME: {
      const primarySubField = resolveFullNameSortSubField(subFieldName);
      const [firstSubField, lastSubField] = ALLOWED_FULL_NAME_SORT_SUBFIELDS;
      const secondarySubField =
        primarySubField === firstSubField ? lastSubField : firstSubField;
      return [
        {
          [field.name]: {
            [primarySubField]: direction ?? 'AscNullsLast',
            [secondarySubField]: direction ?? 'AscNullsLast',
          },
        },
      ];
    }
    case FieldMetadataType.ADDRESS: {
      const subField = resolveAddressSortSubField(field.settings, subFieldName);
      return [
        {
          [field.name]: {
            [subField]: direction ?? 'AscNullsLast',
          },
        },
      ];
    }
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
  field: Pick<FieldMetadataItem, 'name'>,
  relatedObjectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'fields' | 'labelIdentifierFieldMetadataId'
  >,
  direction: OrderBy,
): RecordGqlOperationOrderBy => {
  const labelIdentifierField = getLabelIdentifierFieldMetadataItem(
    relatedObjectMetadataItem,
  );

  if (!labelIdentifierField) {
    return [{ [`${field.name}Id`]: direction }];
  }

  const labelFieldOrderBy = getOrderByForFieldMetadataType(
    labelIdentifierField,
    direction,
  );

  return [{ [field.name]: labelFieldOrderBy[0] }];
};
