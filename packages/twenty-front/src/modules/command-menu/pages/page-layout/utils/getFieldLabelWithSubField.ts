import { getRelationFieldLabel } from '@/command-menu/pages/page-layout/utils/getRelationFieldLabel';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { type CompositeFieldType } from '@/settings/data-model/types/CompositeFieldType';
import { t } from '@lingui/core/macro';
import { type CompositeFieldSubFieldName } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getFieldLabelWithSubField = ({
  field,
  subFieldName,
  objectMetadataItems,
}: {
  field: FieldMetadataItem | undefined;
  subFieldName?: CompositeFieldSubFieldName | string;
  objectMetadataItems?: ObjectMetadataItem[];
}): string => {
  if (!isDefined(field?.label)) {
    return t`Field`;
  }

  if (!isDefined(subFieldName)) {
    return field.label;
  }

  if (isFieldRelation(field)) {
    return getRelationFieldLabel(field, subFieldName, objectMetadataItems);
  }

  if (isCompositeFieldType(field.type)) {
    const subFieldLabel = getCompositeSubFieldLabel(
      field.type as CompositeFieldType,
      subFieldName as CompositeFieldSubFieldName,
    );
    return subFieldLabel ? `${field.label} ${subFieldLabel}` : field.label;
  }

  return field.label;
};
