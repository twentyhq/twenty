import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableRowContextProvider } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellFieldContextWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldContextWrapper';
import { type TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { isDefined } from 'twenty-shared/utils';
import { OverflowingTextTooltipModeProvider } from 'twenty-ui/primitives/typography';

export const RecordTableCellPortalContexts = ({
  position,
  children,
}: {
  position: TableCellPosition;
  children: React.ReactNode;
}) => {
  const allRecordIds = useAtomComponentSelectorValue(
    recordIndexAllRecordIdsComponentSelector,
  );

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );

  const recordId = allRecordIds.at(position.row);

  const isRecordReadOnly = useIsRecordReadOnly({
    recordId: recordId ?? '',
    objectMetadataId: objectMetadataItem.id,
  });

  if (!isDefined(recordId)) {
    return null;
  }

  const recordField = visibleRecordFields[position.column];

  if (!isDefined(recordField)) {
    return null;
  }

  return (
    <RecordTableRowContextProvider
      value={{
        recordId,
        isSelected: false,
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
          recordField,
          columnIndex: position.column,
        }}
      >
        <RecordTableCellFieldContextWrapper recordField={recordField}>
          <OverflowingTextTooltipModeProvider mode="measure-on-open">
            {children}
          </OverflowingTextTooltipModeProvider>
        </RecordTableCellFieldContextWrapper>
      </RecordTableCellContext.Provider>
    </RecordTableRowContextProvider>
  );
};
