import { isPlainManyToOneRelationField } from '@/object-record/utils/isPlainManyToOneRelationField';
import { Dropdown } from 'twenty-ui/components/navigation';

import { fieldMetadataItemByIdSelector } from '@/object-metadata/states/fieldMetadataItemByIdSelector';
import { isFieldMetadataItemLabelIdentifierSelector } from '@/object-metadata/states/isFieldMetadataItemLabelIdentifierSelector';
import { useChangeRecordFieldVisibility } from '@/object-record/record-field/hooks/useChangeRecordFieldVisibility';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { isCanonicalRecordField } from '@/object-record/record-field/utils/isCanonicalRecordField';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useHandleToggleColumnSort } from '@/object-record/record-index/hooks/useHandleToggleColumnSort';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useCanConfigureRecordTableColumns } from '@/object-record/record-table/hooks/useCanConfigureRecordTableColumns';
import { useDeleteRecordTableColumn } from '@/object-record/record-table/hooks/useDeleteRecordTableColumn';
import { useMoveTableColumn } from '@/object-record/record-table/hooks/useMoveTableColumn';
import { useAddRecordTableRelationColumn } from '@/object-record/record-table/hooks/useAddRecordTableRelationColumn';
import { RecordTableAggregateColumnPages } from '@/object-record/record-column-aggregate/components/RecordTableAggregateColumnPages';
import { isPlainOneToManyRelationField } from '@/object-record/utils/isPlainOneToManyRelationField';
import { RecordTableLookupColumnPage } from '@/object-record/record-column-lookup/components/RecordTableLookupColumnPage';
import { useOpenRecordFilterChipFromTableHeader } from '@/object-record/record-table/record-table-header/hooks/useOpenRecordFilterChipFromTableHeader';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useLingui } from '@lingui/react/macro';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { isDefined } from 'twenty-shared/utils';
import {
  IconArrowLeft,
  IconArrowRight,
  IconArrowsSort,
  IconColumnInsertRight,
  IconEyeOff,
  IconFilter,
  IconTrash,
} from 'twenty-ui/icon';

const LOOKUP_TARGET_PAGE_ID = 'lookup-target';
const AGGREGATE_TARGET_PAGE_ID = 'aggregate-target';

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
  const { columnDescriptorByRecordFieldId } = useRecordIndexContextOrThrow();

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

  const { foundFieldMetadataItem: fieldMetadataItem } =
    useAtomFamilySelectorValue(fieldMetadataItemByIdSelector, {
      fieldMetadataItemId: recordField.fieldMetadataItemId,
    });

  const columnDescriptor = columnDescriptorByRecordFieldId[recordField.id];
  const isFilterable = columnDescriptor?.isFilterable === true;
  const isSortable = columnDescriptor?.isSortable === true;

  const canConfigureColumns = useCanConfigureRecordTableColumns();
  const { canPersistChanges } = useCanPersistViewChanges();
  const isCanonical = isCanonicalRecordField(recordField);

  const canAddLookupColumn =
    canConfigureColumns &&
    isCanonical &&
    isDefined(fieldMetadataItem) &&
    isPlainManyToOneRelationField(fieldMetadataItem);
  const canAddAggregateColumn =
    canConfigureColumns &&
    isCanonical &&
    isDefined(fieldMetadataItem) &&
    isPlainOneToManyRelationField(fieldMetadataItem);
  const canDeleteColumn = canPersistChanges && !isCanonical;
  const canHide = isLabelIdentifier !== true && isCanonical;

  const { deleteRecordTableColumn } = useDeleteRecordTableColumn(recordTableId);
  const { addRecordTableRelationColumn } =
    useAddRecordTableRelationColumn(recordTableId);

  const hasColumnActions =
    canAddLookupColumn ||
    canAddAggregateColumn ||
    canMoveLeft ||
    canMoveRight ||
    canHide ||
    canDeleteColumn;
  const showSeparator = (isFilterable || isSortable) && hasColumnActions;

  return (
    <>
      <Dropdown.Page id="root">
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
          {canAddLookupColumn && (
            <Dropdown.ActionItem
              startIcon={<IconColumnInsertRight />}
              page={LOOKUP_TARGET_PAGE_ID}
            >{t`Add lookup column`}</Dropdown.ActionItem>
          )}
          {canAddAggregateColumn && (
            <Dropdown.ActionItem
              startIcon={<IconColumnInsertRight />}
              page={AGGREGATE_TARGET_PAGE_ID}
            >{t`Add aggregate column`}</Dropdown.ActionItem>
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
      </Dropdown.Page>
      {canAddLookupColumn && (
        <RecordTableLookupColumnPage
          pageId={LOOKUP_TARGET_PAGE_ID}
          relationFieldMetadataItem={fieldMetadataItem}
          onSelect={(relationColumnTarget) =>
            addRecordTableRelationColumn({
              relationFieldMetadataItemId: fieldMetadataItem.id,
              ...relationColumnTarget,
            })
          }
        />
      )}
      {canAddAggregateColumn && (
        <RecordTableAggregateColumnPages
          pageId={AGGREGATE_TARGET_PAGE_ID}
          relationFieldMetadataItem={fieldMetadataItem}
          onSelect={(relationColumnTarget) =>
            addRecordTableRelationColumn({
              relationFieldMetadataItemId: fieldMetadataItem.id,
              ...relationColumnTarget,
            })
          }
        />
      )}
    </>
  );
};
