import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { RecordTableColumnScopePageEffect } from '@/object-record/record-column-scope/components/RecordTableColumnScopePageEffect';
import { splitParentRecordIdsIntoPages } from '@/object-record/record-column-scope/utils/splitParentRecordIdsIntoPages';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';

type RecordTableColumnScopePageEffectsProps = {
  recordField: RecordField;
  relationFieldName: string;
  relationObjectMetadataItem: EnrichedObjectMetadataItem;
  scopeView: ViewWithRelations | undefined;
};

export const RecordTableColumnScopePageEffects = ({
  recordField,
  relationFieldName,
  relationObjectMetadataItem,
  scopeView,
}: RecordTableColumnScopePageEffectsProps) => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const parentRecordIds = useAtomComponentSelectorValue(
    recordIndexAllRecordIdsComponentSelector,
    recordTableId,
  );

  return splitParentRecordIdsIntoPages(parentRecordIds).map(
    (parentRecordIdsPage, pageIndex) => (
      <RecordTableColumnScopePageEffect
        key={pageIndex}
        parentRecordIds={parentRecordIdsPage}
        recordField={recordField}
        relationFieldName={relationFieldName}
        relationObjectMetadataItem={relationObjectMetadataItem}
        scopeView={scopeView}
      />
    ),
  );
};
