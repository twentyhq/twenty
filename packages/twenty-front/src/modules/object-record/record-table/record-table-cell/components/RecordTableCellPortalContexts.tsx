import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableRowContextProvider } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellFieldContextWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldContextWrapper';
import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableCellPortalContexts = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const hoverPosition = useRecoilComponentValue(
    recordTableHoverPositionComponentState,
  );

  const allRecordIds = useRecoilComponentValue(
    recordIndexAllRecordIdsComponentSelector,
  );

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const visibleRecordFields = useRecoilComponentValue(
    visibleRecordFieldsComponentSelector,
  );

  const recordId = isDefined(hoverPosition)
    ? allRecordIds.at(hoverPosition.row)
    : null;

  const isRecordReadOnly = useIsRecordReadOnly({
    recordId: recordId ?? '',
    objectMetadataId: objectMetadataItem.id,
  });

  if (!hoverPosition || !isDefined(recordId)) {
    return null;
  }

  return (
    <RecordTableRowContextProvider
      value={{
        recordId,
        rowIndex: hoverPosition.row,
        isSelected: false,
        inView: true,
        pathToShowPage:
          getBasePathToShowPage({
            objectNameSingular: objectMetadataItem.nameSingular,
          }) + recordId,
        objectNameSingular: objectMetadataItem.nameSingular,
        isRecordReadOnly,
      }}
    >
      <RecordTableCellContext.Provider
        value={{
          recordField: visibleRecordFields[hoverPosition.column],
          cellPosition: hoverPosition,
        }}
      >
        <RecordTableCellFieldContextWrapper
          recordField={visibleRecordFields[hoverPosition.column]}
        >
          {children}
        </RecordTableCellFieldContextWrapper>
      </RecordTableCellContext.Provider>
    </RecordTableRowContextProvider>
  );
};
