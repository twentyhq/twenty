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
import {
  type AllowedAddressSubField,
  type AllowedFullNameSubField,
  type OrderBy,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const getOrderByForFieldMetadataType = (
  field: Pick<FieldMetadataItem, 'id' | 'name' | 'type' | 'settings'>,
  direction: OrderBy | null | undefined,
  subFieldName?: string | null,
): RecordGqlOperationOrderBy => {
  switch (field.type) {
    case FieldMetadataType.FULL_NAME: {
      const primarySubField = isDefined(subFieldName)
        ? (subFieldName as AllowedFullNameSubField)
        : FULL_NAME_DEFAULT_SORT_SUB_FIELD;
      const secondarySubField =
        primarySubField === 'firstName' ? 'lastName' : 'firstName';
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
      const subField = isDefined(subFieldName)
        ? (subFieldName as AllowedAddressSubField)
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
