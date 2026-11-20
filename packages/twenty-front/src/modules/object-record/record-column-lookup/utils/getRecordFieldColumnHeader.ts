import { t } from '@lingui/core/macro';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordFieldLookupTarget } from '@/object-record/record-column-lookup/utils/getRecordFieldLookupTarget';
import { isDefined } from 'twenty-shared/utils';

type ColumnHeaderFieldMetadataItem = Pick<
  FieldMetadataItem,
  'label' | 'icon' | 'description'
>;

export const getRecordFieldColumnHeader = ({
  fieldMetadataItem,
  lookupTarget,
  isScopedRelationColumn,
}: {
  fieldMetadataItem: ColumnHeaderFieldMetadataItem;
  lookupTarget:
    | Pick<RecordFieldLookupTarget, 'lookupTargetFieldMetadataItem'>
    | undefined;
  isScopedRelationColumn: boolean;
}): ColumnHeaderFieldMetadataItem => {
  // Tells a scoped column apart from the plain column of the same relation
  if (isScopedRelationColumn) {
    return {
      ...fieldMetadataItem,
      label: `${fieldMetadataItem.label} · ${t`Filtered`}`,
    };
  }

  const lookupTargetFieldMetadataItem =
    lookupTarget?.lookupTargetFieldMetadataItem;

  if (!isDefined(lookupTargetFieldMetadataItem)) {
    return fieldMetadataItem;
  }

  return {
    label: `${fieldMetadataItem.label} › ${lookupTargetFieldMetadataItem.label}`,
    icon: lookupTargetFieldMetadataItem.icon ?? fieldMetadataItem.icon,
    description:
      lookupTargetFieldMetadataItem.description ??
      fieldMetadataItem.description,
  };
};
