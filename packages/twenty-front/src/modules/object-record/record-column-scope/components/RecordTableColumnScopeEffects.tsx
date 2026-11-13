import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { RecordTableColumnScopeEffect } from '@/object-record/record-column-scope/components/RecordTableColumnScopeEffect';
import { isRecordFieldScoped } from '@/object-record/record-column-scope/utils/isRecordFieldScoped';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { scopeViewFromScopedViewFieldIdFamilySelector } from '@/views/states/selectors/scopeViewFromScopedViewFieldIdFamilySelector';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const RecordTableColumnScopeEffectHost = ({
  recordField,
}: {
  recordField: RecordField;
}) => {
  const { objectMetadataItems } = useObjectMetadataItems();
  const { fieldMetadataItemByFieldMetadataItemId } =
    useRecordIndexContextOrThrow();

  const scopeView = useAtomFamilySelectorValue(
    scopeViewFromScopedViewFieldIdFamilySelector,
    { scopedViewFieldId: recordField.id },
  );

  const fieldMetadataItem =
    fieldMetadataItemByFieldMetadataItemId[recordField.fieldMetadataItemId];

  if (
    !isDefined(fieldMetadataItem) ||
    fieldMetadataItem.type !== FieldMetadataType.RELATION ||
    fieldMetadataItem.relation?.type !== RelationType.ONE_TO_MANY ||
    !isRecordFieldScoped({ recordField, scopeView })
  ) {
    return null;
  }

  const relationObjectMetadataItem = objectMetadataItems.find(
    ({ id }) => id === fieldMetadataItem.relation?.targetObjectMetadata.id,
  );

  if (!isDefined(relationObjectMetadataItem)) {
    return null;
  }

  return (
    <RecordTableColumnScopeEffect
      recordField={recordField}
      relationFieldName={fieldMetadataItem.name}
      relationObjectMetadataItem={relationObjectMetadataItem}
      scopeView={scopeView}
    />
  );
};

export const RecordTableColumnScopeEffects = () => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();

  return visibleRecordFields.map((recordField) => (
    <RecordTableColumnScopeEffectHost
      key={recordField.id}
      recordField={recordField}
    />
  ));
};
