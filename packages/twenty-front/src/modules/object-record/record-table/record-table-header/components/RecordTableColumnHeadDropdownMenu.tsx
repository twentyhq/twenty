import { Dropdown } from 'twenty-ui/components/navigation';

import { isFieldMetadataItemFilterableAndSortableSelector } from '@/object-metadata/states/isFieldMetadataItemFilterableAndSortableSelector';
import { isFieldMetadataItemLabelIdentifierSelector } from '@/object-metadata/states/isFieldMetadataItemLabelIdentifierSelector';
import { useChangeRecordFieldVisibility } from '@/object-record/record-field/hooks/useChangeRecordFieldVisibility';
import { useRecordFieldColumnKind } from '@/object-record/record-column-scope/hooks/useRecordFieldColumnKind';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { isCanonicalRecordField } from '@/object-record/record-field/utils/isCanonicalRecordField';
import { useHandleToggleColumnSort } from '@/object-record/record-index/hooks/useHandleToggleColumnSort';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useCanAddRecordTableLookupColumns } from '@/object-record/record-table/hooks/useCanAddRecordTableLookupColumns';
import { useDeleteRecordTableColumn } from '@/object-record/record-table/hooks/useDeleteRecordTableColumn';
import { useMoveTableColumn } from '@/object-record/record-table/hooks/useMoveTableColumn';
import { useOpenRecordFilterChipFromTableHeader } from '@/object-record/record-table/record-table-header/hooks/useOpenRecordFilterChipFromTableHeader';
import { useOpenEditColumnInSidePanel } from '@/side-panel/hooks/useOpenEditColumnInSidePanel';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useLingui } from '@lingui/react/macro';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import {
  IconArrowLeft,
  IconArrowRight,
  IconArrowsSort,
  IconEdit,
  IconEyeOff,
  IconFilter,
  IconTrash,
} from 'twenty-ui/icon';

type RecordTableColumnHeadDropdownMenuProps = {
  recordField: RecordField;
  objectMetadataId: string;
};

export const RecordTableColumnHeadDropdownMenu = ({
  recordField,
  objectMetadataId,
}: RecordTableColumnHeadDropdownMenuProps) => {
  const { t } = useLingui();

  const { visibleRecordFields } = useRecordTableContextOrThrow();

  const isLabelIdentifier = useAtomFamilySelectorValue(
    isFieldMetadataItemLabelIdentifierSelector,
    { fieldMetadataItemId: recordField.fieldMetadataItemId },
  );

  const secondVisibleRecordField = visibleRecordFields[1];
  const canMove = isLabelIdentifier !== true;
  const canMoveLeft =
    recordField.id !== secondVisibleRecordField?.id && canMove;

  const lastVisibleRecordField =
    visibleRecordFields[visibleRecordFields.length - 1];

  const canMoveRight = recordField.id !== lastVisibleRecordField?.id && canMove;

  const { recordTableId } = useRecordTableContextOrThrow();

  const { moveTableColumn } = useMoveTableColumn({
    recordTableId,
  });

  const { changeRecordFieldVisibility } =
    useChangeRecordFieldVisibility(recordTableId);

  const handleColumnMoveLeft = () => {
    if (!canMoveLeft) {
      return;
    }

    moveTableColumn('left', recordField.id);
  };

  const handleColumnMoveRight = () => {
    if (!canMoveRight) {
      return;
    }

    moveTableColumn('right', recordField.id);
  };

  const handleColumnVisibility = async () => {
    await changeRecordFieldVisibility({
      fieldMetadataId: recordField.fieldMetadataItemId,
      recordFieldId: recordField.id,
      isVisible: false,
    });
  };

  const columnKind = useRecordFieldColumnKind(recordField.id);

  const lookupTargetFieldMetadataItem =
    columnKind.kind === 'lookup'
      ? columnKind.lookupTarget.lookupTargetFieldMetadataItem
      : undefined;

  const handleToggleColumnSort = useHandleToggleColumnSort({
    objectMetadataItemId: objectMetadataId,
  });

  const handleSortClick = () => {
    handleToggleColumnSort({
      fieldMetadataId: recordField.fieldMetadataItemId,
      relationTargetFieldMetadataId: lookupTargetFieldMetadataItem?.id,
    });
  };

  const { openRecordFilterChipFromTableHeader } =
    useOpenRecordFilterChipFromTableHeader();

  const handleFilterClick = () => {
    openRecordFilterChipFromTableHeader({
      fieldMetadataItemId: recordField.fieldMetadataItemId,
      relationTargetFieldMetadataItem: lookupTargetFieldMetadataItem,
    });
  };

  const isSummaryColumn = columnKind.kind === 'summary';

  const { isFilterable: isFieldFilterable, isSortable: isFieldSortable } =
    useAtomFamilySelectorValue(
      isFieldMetadataItemFilterableAndSortableSelector,
      {
        fieldMetadataItemId:
          lookupTargetFieldMetadataItem?.id ?? recordField.fieldMetadataItemId,
      },
    );

  const isFilterable = isFieldFilterable && !isSummaryColumn;
  const isSortable = isFieldSortable && !isSummaryColumn;

  const { canPersistChanges } = useCanPersistViewChanges();
  const isCanonical = isCanonicalRecordField(recordField);

  const canDeleteColumn = canPersistChanges && !isCanonical;
  const canHide = isLabelIdentifier !== true && isCanonical;

  const { deleteRecordTableColumn } = useDeleteRecordTableColumn(recordTableId);

  const isScopedRelationColumn = 'scopedRelationAlias' in columnKind;
  const canAddLookupColumns = useCanAddRecordTableLookupColumns();

  const canEditColumn = canAddLookupColumns && isScopedRelationColumn;

  const { openEditColumnInSidePanel } =
    useOpenEditColumnInSidePanel(recordTableId);

  const hasMoveOrHideActions = canMoveLeft || canMoveRight || canHide;
  const showSeparator =
    (isFilterable || isSortable) && (hasMoveOrHideActions || canDeleteColumn);

  const moveAndHideItems = (
    <>
      {canMoveLeft && (
        <Dropdown.ActionItem
          startIcon={<IconArrowLeft />}
          onClick={handleColumnMoveLeft}
          closeOnClick={false}
        >{t`Move left`}</Dropdown.ActionItem>
      )}
      {canMoveRight && (
        <Dropdown.ActionItem
          startIcon={<IconArrowRight />}
          onClick={handleColumnMoveRight}
          closeOnClick={false}
        >{t`Move right`}</Dropdown.ActionItem>
      )}
      {canHide && (
        <Dropdown.ActionItem
          startIcon={<IconEyeOff />}
          onClick={handleColumnVisibility}
        >{t`Hide`}</Dropdown.ActionItem>
      )}
    </>
  );

  const deleteColumnItem = canDeleteColumn && (
    <Dropdown.ActionItem
      startIcon={<IconTrash />}
      onClick={() => deleteRecordTableColumn(recordField.id)}
    >
      {isScopedRelationColumn ? t`Delete summary column` : t`Delete column`}
    </Dropdown.ActionItem>
  );

  if (isScopedRelationColumn) {
    return (
      <Dropdown.Section>
        {canEditColumn && (
          <Dropdown.ActionItem
            startIcon={<IconEdit />}
            onClick={() =>
              openEditColumnInSidePanel({
                fieldMetadataItemId: recordField.fieldMetadataItemId,
                recordFieldId: recordField.id,
              })
            }
          >{t`Edit summary column…`}</Dropdown.ActionItem>
        )}
        {deleteColumnItem}
        {(canEditColumn || canDeleteColumn) && hasMoveOrHideActions && (
          <Dropdown.Separator />
        )}
        {moveAndHideItems}
      </Dropdown.Section>
    );
  }

  return (
    <Dropdown.Section>
      {isFilterable && (
        <Dropdown.ActionItem
          startIcon={<IconFilter />}
          onClick={handleFilterClick}
        >{t`Filter`}</Dropdown.ActionItem>
      )}
      {isSortable && (
        <Dropdown.ActionItem
          startIcon={<IconArrowsSort />}
          onClick={handleSortClick}
        >{t`Sort`}</Dropdown.ActionItem>
      )}
      {showSeparator && <Dropdown.Separator />}
      {moveAndHideItems}
      {deleteColumnItem}
    </Dropdown.Section>
  );
};
