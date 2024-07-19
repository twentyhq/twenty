import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { OrderBy } from '@/object-metadata/types/OrderBy';
import { RecordGqlOperationOrderBy } from '@/object-record/graphql/types/RecordGqlOperationOrderBy';
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
    default:
      return [
        {
          [field.name]: direction ?? 'AscNullsLast',
        },
      ];
  }
};
