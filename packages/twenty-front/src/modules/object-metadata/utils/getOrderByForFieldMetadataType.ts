import { FULL_NAME_DEFAULT_SORT_SUB_FIELD } from '@/object-metadata/constants/FullNameDefaultSortSubField';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getDefaultSortSubFieldForAddress } from '@/object-metadata/utils/getDefaultSortSubFieldForAddress';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';

import {
  type FieldEmailsValue,
  type FieldLinksValue,
  type FieldPhonesValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { ALLOWED_FULL_NAME_SUBFIELDS } from 'twenty-shared/constants';
import {
  ALLOWED_ADDRESS_SUBFIELDS,
  type AllowedAddressSubField,
  type AllowedFullNameSubField,
  type OrderBy,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const isAllowedFullNameSubField = (
  value: string | null | undefined,
): value is AllowedFullNameSubField =>
  ALLOWED_FULL_NAME_SUBFIELDS.includes(value as AllowedFullNameSubField);

const isAllowedAddressSubField = (
  value: string | null | undefined,
): value is AllowedAddressSubField =>
  ALLOWED_ADDRESS_SUBFIELDS.includes(value as AllowedAddressSubField);

export const getOrderByForFieldMetadataType = (
  field: Pick<FieldMetadataItem, 'id' | 'name' | 'type' | 'settings'>,
  direction: OrderBy | null | undefined,
  subFieldName?: string | null,
): RecordGqlOperationOrderBy => {
  switch (field.type) {
    case FieldMetadataType.FULL_NAME: {
      const primarySubField = isAllowedFullNameSubField(subFieldName)
        ? subFieldName
        : FULL_NAME_DEFAULT_SORT_SUB_FIELD;
      const [firstSubField, lastSubField] = ALLOWED_FULL_NAME_SUBFIELDS;
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
      const subField = isAllowedAddressSubField(subFieldName)
        ? subFieldName
        : getDefaultSortSubFieldForAddress(field.settings);
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
