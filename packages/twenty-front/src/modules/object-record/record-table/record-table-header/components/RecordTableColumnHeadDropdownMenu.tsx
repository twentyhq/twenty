import { DropdownListItem } from '@/ui/layout/dropdown/components/DropdownListItem';
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
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useLingui } from '@lingui/react/macro';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import {
  IconArrowLeft,
  IconArrowRight,
  IconArrowsSort,
  IconEyeOff,
  IconFilter,
} from 'twenty-ui/icon';

export type RecordTableColumnHeadDropdownMenuProps = {
  recordField: RecordField;
  objectMetadataId: string;
};

const StyledDropdownMenuItemsContainerWrapper = styled.div`
  z-index: ${themeCssVariables.lastLayerZIndex};
`;

export const RecordTableColumnHeadDropdownMenu = ({
  recordField,
  objectMetadataId,
}: RecordTableColumnHeadDropdownMenuProps) => {
  const { t } = useLingui();

  const { toggleScrollXWrapper, toggleScrollYWrapper } =
    useToggleScrollWrapper();

  const { visibleRecordFields } = useRecordTableContextOrThrow();

  const isLabelIdentifier = useAtomFamilySelectorValue(
    isFieldMetadataItemLabelIdentifierSelector,
    { fieldMetadataItemId: recordField.fieldMetadataItemId },
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
    if (!canMoveLeft) return;

    moveTableColumn('left', recordField.fieldMetadataItemId);
  };

  const handleColumnMoveRight = () => {
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

  const { isFilterable, isSortable } = useAtomFamilySelectorValue(
    isFieldMetadataItemFilterableAndSortableSelector,
    { fieldMetadataItemId: recordField.fieldMetadataItemId },
  );

  const showSeparator =
    (isFilterable || isSortable) && isLabelIdentifier !== true;
  const canHide = isLabelIdentifier !== true;

  return (
    <DropdownContent>
      <StyledDropdownMenuItemsContainerWrapper>
        <DropdownMenuItemsContainer>
          {isFilterable && (
            <DropdownListItem
              startIcon={<IconFilter />}
              onClick={handleFilterClick}
            >{t`Filter`}</DropdownListItem>
          )}
          {isSortable && (
            <DropdownListItem
              startIcon={<IconArrowsSort />}
              onClick={handleSortClick}
            >{t`Sort`}</DropdownListItem>
          )}
          {showSeparator && <DropdownMenuSeparator />}
          {canMoveLeft && (
            <DropdownListItem
              startIcon={<IconArrowLeft />}
              onClick={handleColumnMoveLeft}
            >{t`Move left`}</DropdownListItem>
          )}
          {canMoveRight && (
            <DropdownListItem
              startIcon={<IconArrowRight />}
              onClick={handleColumnMoveRight}
            >{t`Move right`}</DropdownListItem>
          )}
          {canHide && (
            <DropdownListItem
              startIcon={<IconEyeOff />}
              onClick={handleColumnVisibility}
            >{t`Hide`}</DropdownListItem>
          )}
        </DropdownMenuItemsContainer>
      </StyledDropdownMenuItemsContainerWrapper>
    </DropdownContent>
  );
};
