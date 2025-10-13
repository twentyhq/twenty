import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { isDefined } from 'twenty-shared/utils';
import { type Maybe } from '~/generated/graphql';

type GetFieldKeyParams = {
  field: FieldMetadataItem;
  subFieldName?: Maybe<string>;
};

export const getFieldKey = ({
  field,
  subFieldName,
}: GetFieldKeyParams): string => {
  const isComposite = isCompositeFieldType(field.type);

  return isComposite && isDefined(subFieldName)
    ? `${field.name}.${subFieldName}`
    : field.name;
};
