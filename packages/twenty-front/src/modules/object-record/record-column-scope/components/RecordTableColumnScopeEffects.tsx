import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { RecordTableColumnScopePageEffect } from '@/object-record/record-column-scope/components/RecordTableColumnScopePageEffect';
import { isRecordFieldScoped } from '@/object-record/record-column-scope/utils/isRecordFieldScoped';
import { isScopableRelationField } from '@/object-record/record-column-scope/utils/isScopableRelationField';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { findRelationTargetObjectMetadataItem } from '@/related-record-paths/utils/findRelationTargetObjectMetadataItem';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { scopeViewFromOwnerViewFieldIdFamilySelector } from '@/views/states/selectors/scopeViewFromOwnerViewFieldIdFamilySelector';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { arrayToChunks } from '~/utils/array/arrayToChunks';

const RecordTableColumnScopeEffectHost = ({
  recordField,
}: {
  recordField: RecordField;
}) => {
  const { objectMetadataItems } = useObjectMetadataItems();
  const { fieldMetadataItemByFieldMetadataItemId } =
    useRecordIndexContextOrThrow();
  const { recordTableId } = useRecordTableContextOrThrow();

  const parentRecordIds = useAtomComponentSelectorValue(
    recordIndexAllRecordIdsComponentSelector,
    recordTableId,
  );

  const scopeView = useAtomFamilySelectorValue(
    scopeViewFromOwnerViewFieldIdFamilySelector,
    { ownerViewFieldId: recordField.id },
  );

  const fieldMetadataItem =
    fieldMetadataItemByFieldMetadataItemId[recordField.fieldMetadataItemId];

  if (
    !isDefined(fieldMetadataItem) ||
    !isScopableRelationField(fieldMetadataItem) ||
    !isRecordFieldScoped({ recordField, scopeView })
  ) {
    return null;
  }

  const relationObjectMetadataItem = findRelationTargetObjectMetadataItem({
    fieldMetadataItem,
    objectMetadataItems,
  });

  if (!isDefined(relationObjectMetadataItem)) {
    return null;
  }

  // Fixed page boundaries keep earlier pages' variables stable as rows load, so only the last page refetches
  return arrayToChunks(parentRecordIds, QUERY_MAX_RECORDS).map(
    (parentRecordIdsPage, pageIndex) => (
      <RecordTableColumnScopePageEffect
        key={pageIndex}
        parentRecordIds={parentRecordIdsPage}
        recordField={recordField}
        relationFieldName={fieldMetadataItem.name}
        relationObjectMetadataItem={relationObjectMetadataItem}
        scopeView={scopeView}
      />
    ),
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
