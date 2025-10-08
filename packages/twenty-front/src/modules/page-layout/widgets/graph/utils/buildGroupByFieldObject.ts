import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { isDefined } from 'twenty-shared/utils';

export const buildGroupByFieldObject = ({
  field,
  subFieldName,
}: {
  field: FieldMetadataItem;
  subFieldName?: string | null;
}): Record<string, boolean | Record<string, boolean>> => {
  const isRelation = isFieldRelation(field) || isFieldMorphRelation(field);
  const isComposite = isCompositeFieldType(field.type);

  if (isRelation) {
    return { [`${field.name}Id`]: true };
  }

  if (isComposite) {
    if (!isDefined(subFieldName)) {
      throw new Error(
        `Composite field ${field.name} requires a subfield to be specified`,
      );
    }
    return {
      [field.name]: {
        [subFieldName]: true,
      },
    };
  }

  return { [field.name]: true };
};
