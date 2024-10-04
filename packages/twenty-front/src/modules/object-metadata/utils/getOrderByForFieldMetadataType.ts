import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

import { RecordGqlOperationOrderBy } from '@/object-record/graphql/types/RecordGqlOperationOrderBy';
import {
  FieldEmailsValue,
  FieldLinksValue,
  FieldPhonesValue,
} from '@/object-record/record-field/types/FieldMetadata';
import { OrderBy } from '@/types/OrderBy';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const getOrderByForFieldMetadataType = (
  field: Pick<FieldMetadataItem, 'id' | 'name' | 'type'>,
  direction: OrderBy | null | undefined,
): RecordGqlOperationOrderBy => {
  switch (field.type) {
    case FieldMetadataType.FullName:
      return [
        {
          [field.name]: {
            firstName: direction ?? 'AscNullsLast',
            lastName: direction ?? 'AscNullsLast',
          },
        },
      ];
    case FieldMetadataType.Currency:
      return [
        {
          [field.name]: {
            amountMicros: direction ?? 'AscNullsLast',
          },
        },
      ];
    case FieldMetadataType.Actor:
      return [
        {
          [field.name]: {
            name: direction ?? 'AscNullsLast',
          },
        },
      ];
    case FieldMetadataType.Links:
      return [
        {
          [field.name]: {
            primaryLinkUrl: direction ?? 'AscNullsLast',
          } satisfies { [key in keyof FieldLinksValue]?: OrderBy },
        },
      ];
    case FieldMetadataType.Emails:
      return [
        {
          [field.name]: {
            primaryEmail: direction ?? 'AscNullsLast',
          } satisfies { [key in keyof FieldEmailsValue]?: OrderBy },
        },
      ];
    case FieldMetadataType.Phones:
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
