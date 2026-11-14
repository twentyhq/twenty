import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { isPlainOneToManyRelationField } from '@/object-record/utils/isPlainOneToManyRelationField';
import { type View } from '@/views/types/View';
import { isDefined } from 'twenty-shared/utils';

export const isScopedRelationColumn = ({
  fieldMetadataItem,
  recordField,
  scopeView,
}: {
  fieldMetadataItem: FieldMetadataItem;
  recordField: Pick<RecordField, 'settings'>;
  scopeView: Pick<View, 'id'> | undefined;
}): boolean =>
  isPlainOneToManyRelationField(fieldMetadataItem) &&
  (isDefined(scopeView) || isDefined(recordField.settings?.recordLimit));
