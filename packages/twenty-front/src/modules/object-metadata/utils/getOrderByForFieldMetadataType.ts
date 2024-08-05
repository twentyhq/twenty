import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { OrderBy } from '@/object-metadata/types/OrderBy';
import { RecordGqlOperationOrderBy } from '@/object-record/graphql/types/RecordGqlOperationOrderBy';
import { FieldLinksValue } from '@/object-record/record-field/types/FieldMetadata';
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
    default:
      return [
        {
          [field.name]: direction ?? 'AscNullsLast',
        },
      ];
  }
};
