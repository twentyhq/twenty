import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';

import { isFieldMetadataItemFilterableAndSortableSelector } from '@/object-metadata/states/isFieldMetadataItemFilterableAndSortableSelector';
import { isFieldMetadataItemLabelIdentifierSelector } from '@/object-metadata/states/isFieldMetadataItemLabelIdentifierSelector';
import { useChangeRecordFieldVisibility } from '@/object-record/record-field/hooks/useChangeRecordFieldVisibility';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { useHandleToggleColumnSort } from '@/object-record/record-index/hooks/useHandleToggleColumnSort';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useMoveTableColumn } from '@/object-record/record-table/hooks/useMoveTableColumn';
import { useOpenRecordFilterChipFromTableHeader } from '@/object-record/record-table/record-table-header/hooks/useOpenRecordFilterChipFromTableHeader';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useToggleScrollWrapper } from '@/ui/utilities/scroll/hooks/useToggleScrollWrapper';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import {
  IconArrowLeft,
  IconArrowRight,
  IconEyeOff,
  IconFilter,
  IconSortDescending,
} from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

export type RecordTableColumnHeadDropdownMenuProps = {
  recordField: RecordField;
  objectMetadataId: string;
};

const StyledDropdownMenuItemsContainer = styled(DropdownMenuItemsContainer)`
  z-index: ${({ theme }) => theme.lastLayerZIndex};
`;

export const RecordTableColumnHeadDropdownMenu = ({
  recordField,
  objectMetadataId,
}: RecordTableColumnHeadDropdownMenuProps) => {
  const { t } = useLingui();

  const { toggleScrollXWrapper, toggleScrollYWrapper } =
    useToggleScrollWrapper();

  const { visibleRecordFields } = useRecordTableContextOrThrow();

  const isLabelIdentifier = useRecoilValue(
    isFieldMetadataItemLabelIdentifierSelector({
      fieldMetadataItemId: recordField.fieldMetadataItemId,
    }),
  );

  const secondVisibleRecordField = visibleRecordFields[1];
  const canMove = isLabelIdentifier !== true;
  const canMoveLeft =
    recordField.fieldMetadataItemId !==
      secondVisibleRecordField?.fieldMetadataItemId && canMove;

  const lastVisibleRecordField =
    visibleRecordFields[visibleRecordFields.length - 1];

  const canMoveRight =
    recordField.fieldMetadataItemId !==
      lastVisibleRecordField?.fieldMetadataItemId && canMove;

  const { recordTableId } = useRecordTableContextOrThrow();

  const { moveTableColumn } = useMoveTableColumn({
    recordTableId,
  });

  const { changeRecordFieldVisibility } =
    useChangeRecordFieldVisibility(recordTableId);

  const dropdownId = recordField.fieldMetadataItemId + '-header';

  const { closeDropdown } = useCloseDropdown();

  const closeDropdownAndToggleScroll = () => {
    closeDropdown(dropdownId);
    toggleScrollXWrapper(true);
    toggleScrollYWrapper(false);
  };

  const handleColumnMoveLeft = () => {
    closeDropdownAndToggleScroll();

    if (!canMoveLeft) return;

    moveTableColumn('left', recordField.fieldMetadataItemId);
  };

  const handleColumnMoveRight = () => {
    closeDropdownAndToggleScroll();

    if (!canMoveRight) return;

    moveTableColumn('right', recordField.fieldMetadataItemId);
  };

  const handleColumnVisibility = async () => {
    closeDropdownAndToggleScroll();
    await changeRecordFieldVisibility({
      fieldMetadataId: recordField.fieldMetadataItemId,
      isVisible: false,
    });
  };

  const handleToggleColumnSort = useHandleToggleColumnSort({
    objectMetadataItemId: objectMetadataId,
  });

  const handleSortClick = () => {
    closeDropdownAndToggleScroll();

    handleToggleColumnSort(recordField.fieldMetadataItemId);
  };

  const { openRecordFilterChipFromTableHeader } =
    useOpenRecordFilterChipFromTableHeader();

  const handleFilterClick = () => {
    closeDropdownAndToggleScroll();

    openRecordFilterChipFromTableHeader(recordField.fieldMetadataItemId);
  };

  const { isFilterable, isSortable } = useRecoilValue(
    isFieldMetadataItemFilterableAndSortableSelector({
      fieldMetadataItemId: recordField.fieldMetadataItemId,
    }),
  );

  const showSeparator =
    (isFilterable || isSortable) && isLabelIdentifier !== true;
  const canHide = isLabelIdentifier !== true;

  return (
    <DropdownContent>
      <StyledDropdownMenuItemsContainer>
        {isFilterable && (
          <MenuItem
            LeftIcon={IconFilter}
            onClick={handleFilterClick}
            text={t`Filter`}
          />
        )}
        {isSortable && (
          <MenuItem
            LeftIcon={IconSortDescending}
            onClick={handleSortClick}
            text={t`Sort`}
          />
        )}
        {showSeparator && <DropdownMenuSeparator />}
        {canMoveLeft && (
          <MenuItem
            LeftIcon={IconArrowLeft}
            onClick={handleColumnMoveLeft}
            text={t`Move left`}
          />
        )}
        {canMoveRight && (
          <MenuItem
            LeftIcon={IconArrowRight}
            onClick={handleColumnMoveRight}
            text={t`Move right`}
          />
        )}
        {canHide && (
          <MenuItem
            LeftIcon={IconEyeOff}
            onClick={async () => await handleColumnVisibility()}
            text={t`Hide`}
          />
        )}
      </StyledDropdownMenuItemsContainer>
    </DropdownContent>
  );
};
