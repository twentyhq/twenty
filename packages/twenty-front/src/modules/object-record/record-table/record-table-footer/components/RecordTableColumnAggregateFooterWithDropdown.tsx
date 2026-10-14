import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getRecordFieldKey } from '@/object-record/record-field/utils/getRecordFieldKey';
import { resolveRecordFieldRelationTraversal } from '@/object-record/record-field/utils/relation-traversal/resolveRecordFieldRelationTraversal';
import { isDefined } from 'twenty-shared/utils';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableColumnAggregateFooterCellContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterCellContext';
import { RecordTableColumnAggregateFooterDropdownContent } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterDropdownContent';
import { RecordTableColumnAggregateFooterDropdownContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterDropdownContext';
import { RecordTableColumnAggregateFooterValueCell } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterValueCell';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { useToggleScrollWrapper } from '@/ui/utilities/scroll/hooks/useToggleScrollWrapper';
import { useCallback, useContext } from 'react';
import { Dropdown } from 'twenty-ui/components/navigation';

type RecordTableColumnFooterWithDropdownProps = {
  isFirstCell: boolean;
  currentRecordGroupId?: string;
};

export const RecordTableColumnFooterWithDropdown = ({
  currentRecordGroupId,
  isFirstCell,
}: RecordTableColumnFooterWithDropdownProps) => {
  const { fieldMetadataId, recordFieldKey, viewFieldId } = useContext(
    RecordTableColumnAggregateFooterCellContext,
  );

  const { objectMetadataItem, visibleRecordFields } =
    useRecordTableContextOrThrow();

  const { objectMetadataItems } = useObjectMetadataItems();

  const recordField = visibleRecordFields.find(
    (visibleRecordField) =>
      getRecordFieldKey(visibleRecordField) === recordFieldKey,
  );

  // A column through a relation aggregates the target field of the related object.
  const relationTraversal = isDefined(recordField)
    ? resolveRecordFieldRelationTraversal({
        recordField,
        sourceObjectMetadataItem: objectMetadataItem,
        objectMetadataItems,
      })
    : null;

  const fieldMetadata =
    relationTraversal?.targetFieldMetadataItem ??
    objectMetadataItem.fields.find((field) => field.id === fieldMetadataId);

  const { toggleScrollXWrapper, toggleScrollYWrapper } =
    useToggleScrollWrapper();

  const handleDropdownOpen = useCallback(() => {
    toggleScrollXWrapper(false);
    toggleScrollYWrapper(false);
  }, [toggleScrollXWrapper, toggleScrollYWrapper]);

  const handleDropdownClose = useCallback(() => {
    toggleScrollXWrapper(true);
    toggleScrollYWrapper(true);
  }, [toggleScrollXWrapper, toggleScrollYWrapper]);

  const dropdownId = currentRecordGroupId
    ? `${recordFieldKey}-footer-${currentRecordGroupId}`
    : `${recordFieldKey}-footer`;

  return (
    <DropdownRoot
      dropdownId={dropdownId}
      type="picker"
      onOpenChange={(open) => {
        if (open) {
          handleDropdownOpen();
          return;
        }
        handleDropdownClose();
      }}
    >
      <Dropdown.Trigger render={<div />} nativeButton={false}>
        <RecordTableColumnAggregateFooterValueCell
          dropdownId={dropdownId}
          isFirstCell={isFirstCell}
        />
      </Dropdown.Trigger>
      <DropdownContent align="start" alignOffset={-1}>
        <RecordTableColumnAggregateFooterDropdownContext.Provider
          value={{
            dropdownId,
            viewFieldId,
            fieldMetadataId: fieldMetadata?.id ?? fieldMetadataId,
            fieldMetadataType: fieldMetadata?.type,
          }}
        >
          <RecordTableColumnAggregateFooterDropdownContent />
        </RecordTableColumnAggregateFooterDropdownContext.Provider>
      </DropdownContent>
    </DropdownRoot>
  );
};
