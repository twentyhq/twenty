import { Dropdown } from 'twenty-ui/components/navigation';

import { fieldMetadataItemByIdSelector } from '@/object-metadata/states/fieldMetadataItemByIdSelector';
import { isFieldMetadataItemFilterableAndSortableSelector } from '@/object-metadata/states/isFieldMetadataItemFilterableAndSortableSelector';
import { isFieldMetadataItemLabelIdentifierSelector } from '@/object-metadata/states/isFieldMetadataItemLabelIdentifierSelector';
import { useChangeRecordFieldVisibility } from '@/object-record/record-field/hooks/useChangeRecordFieldVisibility';
import { isOneToManyRelationField } from '@/object-metadata/utils/isOneToManyRelationField';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { isCanonicalRecordField } from '@/object-record/record-field/utils/isCanonicalRecordField';
import { useHandleToggleColumnSort } from '@/object-record/record-index/hooks/useHandleToggleColumnSort';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useAddRecordTableColumn } from '@/object-record/record-table/hooks/useAddRecordTableColumn';
import { useCanConfigureRecordTableColumns } from '@/object-record/record-table/hooks/useCanConfigureRecordTableColumns';
import { useDeleteRecordTableColumn } from '@/object-record/record-table/hooks/useDeleteRecordTableColumn';
import { useMoveTableColumn } from '@/object-record/record-table/hooks/useMoveTableColumn';
import { useOpenRecordFilterChipFromTableHeader } from '@/object-record/record-table/record-table-header/hooks/useOpenRecordFilterChipFromTableHeader';
import { useOpenEditColumnInSidePanel } from '@/side-panel/hooks/useOpenEditColumnInSidePanel';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useLingui } from '@lingui/react/macro';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { isDefined } from 'twenty-shared/utils';
import {
  IconArrowLeft,
  IconArrowRight,
  IconArrowsSort,
  IconColumnInsertRight,
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

  const handleToggleColumnSort = useHandleToggleColumnSort({
    objectMetadataItemId: objectMetadataId,
  });

  const handleSortClick = () => {
    handleToggleColumnSort(recordField.fieldMetadataItemId);
  };

  const { openRecordFilterChipFromTableHeader } =
    useOpenRecordFilterChipFromTableHeader();

  const handleFilterClick = () => {
    openRecordFilterChipFromTableHeader(recordField.fieldMetadataItemId);
  };

  const { isFilterable, isSortable } = useAtomFamilySelectorValue(
    isFieldMetadataItemFilterableAndSortableSelector,
    { fieldMetadataItemId: recordField.fieldMetadataItemId },
  );

  const { foundFieldMetadataItem: fieldMetadataItem } =
    useAtomFamilySelectorValue(fieldMetadataItemByIdSelector, {
      fieldMetadataItemId: recordField.fieldMetadataItemId,
    });

  const canConfigureColumns = useCanConfigureRecordTableColumns();
  const { canPersistChanges } = useCanPersistViewChanges();
  const isCanonical = isCanonicalRecordField(recordField);

  const canAddColumn =
    canConfigureColumns &&
    isCanonical &&
    isDefined(fieldMetadataItem) &&
    isOneToManyRelationField(fieldMetadataItem);
  const canEditColumn = canConfigureColumns && !isCanonical;
  const canDeleteColumn = canPersistChanges && !isCanonical;
  const canHide = isLabelIdentifier !== true && isCanonical;

  const { openEditColumnInSidePanel } = useOpenEditColumnInSidePanel();
  const { addRecordTableColumn } = useAddRecordTableColumn(recordTableId);
  const { deleteRecordTableColumn } = useDeleteRecordTableColumn(recordTableId);

  const handleAddColumnClick = async () => {
    const addedRecordField = await addRecordTableColumn(recordField);

    if (!isDefined(addedRecordField)) {
      return;
    }

    openEditColumnInSidePanel({
      recordTableId,
      recordFieldId: addedRecordField.id,
    });
  };

  const hasColumnActions =
    canAddColumn ||
    canEditColumn ||
    canMoveLeft ||
    canMoveRight ||
    canHide ||
    canDeleteColumn;
  const showSeparator = (isFilterable || isSortable) && hasColumnActions;

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
      {canAddColumn && (
        <Dropdown.ActionItem
          startIcon={<IconColumnInsertRight />}
          onClick={handleAddColumnClick}
        >{t`Add column`}</Dropdown.ActionItem>
      )}
      {canEditColumn && (
        <Dropdown.ActionItem
          startIcon={<IconEdit />}
          onClick={() =>
            openEditColumnInSidePanel({
              recordTableId,
              recordFieldId: recordField.id,
            })
          }
        >{t`Edit column`}</Dropdown.ActionItem>
      )}
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
      {canDeleteColumn && (
        <Dropdown.ActionItem
          startIcon={<IconTrash />}
          onClick={() => deleteRecordTableColumn(recordField.id)}
        >{t`Delete column`}</Dropdown.ActionItem>
      )}
    </Dropdown.Section>
  );
};
