import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { resolveAddressSortSubField } from '@/object-metadata/utils/resolveAddressSortSubField';
import { resolvePrimaryFullNameSortSubField } from '@/object-metadata/utils/resolvePrimaryFullNameSortSubField';

import {
  type FieldEmailsValue,
  type FieldLinksValue,
  type FieldPhonesValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import {
  type FieldMetadataSettingsMapping,
  type OrderBy,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const getOrderByForFieldMetadataType = ({
  field,
  orderByDirection,
  primaryCompositeSubField,
}: {
  field: Pick<FieldMetadataItem, 'id' | 'name' | 'type' | 'settings'>;
  orderByDirection: OrderBy | null | undefined;
  primaryCompositeSubField?: string | null;
}): RecordGqlOperationOrderBy => {
  switch (field.type) {
    case FieldMetadataType.FULL_NAME: {
      const primarySubField = resolvePrimaryFullNameSortSubField({
        requestedPrimarySubField: primaryCompositeSubField,
      });
      const secondarySubField =
        primarySubField === 'firstName' ? 'lastName' : 'firstName';
      const direction = orderByDirection ?? 'AscNullsLast';
      return [
        { [field.name]: { [primarySubField]: direction } },
        { [field.name]: { [secondarySubField]: direction } },
      ];
    }
    case FieldMetadataType.ADDRESS: {
      const subField = resolveAddressSortSubField({
        settings: field.settings as
          | FieldMetadataSettingsMapping[FieldMetadataType.ADDRESS]
          | null
          | undefined,
        primaryCompositeSubField,
      });
      return [
        {
          [field.name]: {
            [subField]: orderByDirection ?? 'AscNullsLast',
          },
        },
      ];
    }
    case FieldMetadataType.CURRENCY:
      return [
        {
          [field.name]: {
            amountMicros: orderByDirection ?? 'AscNullsLast',
          },
        },
      ];
    case FieldMetadataType.ACTOR:
      return [
        {
          [field.name]: {
            name: orderByDirection ?? 'AscNullsLast',
          },
        },
      ];
    case FieldMetadataType.LINKS:
      return [
        {
          [field.name]: {
            primaryLinkUrl: orderByDirection ?? 'AscNullsLast',
          } satisfies { [key in keyof FieldLinksValue]?: OrderBy },
        },
      ];
    case FieldMetadataType.EMAILS:
      return [
        {
          [field.name]: {
            primaryEmail: orderByDirection ?? 'AscNullsLast',
          } satisfies { [key in keyof FieldEmailsValue]?: OrderBy },
        },
      ];
    case FieldMetadataType.PHONES:
      return [
        {
          [field.name]: {
            primaryPhoneNumber: orderByDirection ?? 'AscNullsLast',
          } satisfies { [key in keyof FieldPhonesValue]?: OrderBy },
        },
      ];
    default:
      return [
        {
          [field.name]: orderByDirection ?? 'AscNullsLast',
        },
      ];
  }
};

export const getOrderByForRelationField = ({
  field,
  relatedObjectMetadataItem,
  orderByDirection,
}: {
  field: Pick<FieldMetadataItem, 'name'>;
  relatedObjectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'fields' | 'labelIdentifierFieldMetadataId'
  >;
  orderByDirection: OrderBy;
}): RecordGqlOperationOrderBy => {
  const labelIdentifierField = getLabelIdentifierFieldMetadataItem(
    relatedObjectMetadataItem,
  );

  if (!labelIdentifierField) {
    return [{ [`${field.name}Id`]: orderByDirection }];
  }

  const labelFieldOrderBy = getOrderByForFieldMetadataType({
    field: labelIdentifierField,
    orderByDirection,
  });

  return labelFieldOrderBy.map((entry) => ({ [field.name]: entry }));
};
