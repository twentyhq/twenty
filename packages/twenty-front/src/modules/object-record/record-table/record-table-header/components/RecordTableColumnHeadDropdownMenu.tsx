import { Dropdown } from 'twenty-ui/components/navigation';

import { isFieldMetadataItemFilterableAndSortableSelector } from '@/object-metadata/states/isFieldMetadataItemFilterableAndSortableSelector';
import { isFieldMetadataItemLabelIdentifierSelector } from '@/object-metadata/states/isFieldMetadataItemLabelIdentifierSelector';
import { useChangeRecordFieldVisibility } from '@/object-record/record-field/hooks/useChangeRecordFieldVisibility';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { getRecordFieldKey } from '@/object-record/record-field/utils/getRecordFieldKey';
import { useHandleToggleColumnSort } from '@/object-record/record-index/hooks/useHandleToggleColumnSort';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useMoveTableColumn } from '@/object-record/record-table/hooks/useMoveTableColumn';
import { useOpenRecordFilterChipFromTableHeader } from '@/object-record/record-table/record-table-header/hooks/useOpenRecordFilterChipFromTableHeader';
import { useLingui } from '@lingui/react/macro';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { isDefined } from 'twenty-shared/utils';
import {
  IconArrowLeft,
  IconArrowRight,
  IconArrowsSort,
  IconEyeOff,
  IconFilter,
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

  const recordFieldKey = getRecordFieldKey(recordField);

  const secondVisibleRecordField = visibleRecordFields[1];
  const canMove = isLabelIdentifier !== true;
  const canMoveLeft =
    isDefined(secondVisibleRecordField) &&
    recordFieldKey !== getRecordFieldKey(secondVisibleRecordField) &&
    canMove;

  const lastVisibleRecordField =
    visibleRecordFields[visibleRecordFields.length - 1];

  const canMoveRight =
    isDefined(lastVisibleRecordField) &&
    recordFieldKey !== getRecordFieldKey(lastVisibleRecordField) &&
    canMove;

  const { recordTableId } = useRecordTableContextOrThrow();

  const { moveTableColumn } = useMoveTableColumn({
    recordTableId,
  });

  const { changeRecordFieldVisibility } =
    useChangeRecordFieldVisibility(recordTableId);

  const handleColumnMoveLeft = () => {
    if (!canMoveLeft) return;

    moveTableColumn('left', recordFieldKey);
  };

  const handleColumnMoveRight = () => {
    if (!canMoveRight) return;

    moveTableColumn('right', recordFieldKey);
  };

  const handleColumnVisibility = async () => {
    await changeRecordFieldVisibility({
      recordField,
      isVisible: false,
    });
  };

  const handleToggleColumnSort = useHandleToggleColumnSort({
    objectMetadataItemId: objectMetadataId,
  });

  const handleSortClick = () => {
    handleToggleColumnSort(recordField);
  };

  const { openRecordFilterChipFromTableHeader } =
    useOpenRecordFilterChipFromTableHeader();

  const handleFilterClick = () => {
    openRecordFilterChipFromTableHeader(recordField);
  };

  // A column through a relation filters and sorts on the target field.
  const { isFilterable, isSortable } = useAtomFamilySelectorValue(
    isFieldMetadataItemFilterableAndSortableSelector,
    {
      fieldMetadataItemId:
        recordField.relationTargetFieldMetadataItemId ??
        recordField.fieldMetadataItemId,
    },
  );

  const showSeparator =
    (isFilterable || isSortable) && isLabelIdentifier !== true;
  const canHide = isLabelIdentifier !== true;

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
    </Dropdown.Section>
  );
};
