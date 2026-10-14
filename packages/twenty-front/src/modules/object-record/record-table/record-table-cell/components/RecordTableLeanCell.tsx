import { css, cx } from '@linaria/core';
import { useContext, type MouseEvent } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { FieldFocusStaticUnfocusedProvider } from '@/object-record/record-field/ui/contexts/FieldFocusContextProvider';
import { RatingFieldStaticDisplay } from '@/object-record/record-field/ui/meta-types/display/components/RatingFieldStaticDisplay';
import { isFieldRating } from '@/object-record/record-field/ui/types/guards/isFieldRating';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RECORD_TABLE_CELL_CONTENT_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableCellContentClassName';
import { RECORD_TABLE_CELL_DISPLAY_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableCellDisplayClassName';
import { useRecordTableBodyContextOrThrow } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableUpdateContext } from '@/object-record/record-table/contexts/RecordTableUpdateContext';
import { getRecordTableCellId } from '@/object-record/record-table/utils/getRecordTableCellId';
import { getRecordTableColumnFieldWidthClassName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthClassName';

const cellClassName = css`
  background: ${themeCssVariables.background.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  border-right: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.primary};
  padding: 0;
  text-align: left;

  &[data-selected] {
    background: ${themeCssVariables.accent.quaternary};
  }

  &[data-dragging] {
    background: transparent;
    border-bottom-color: transparent;
  }
`;

const contentClassName = css`
  align-items: center;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  height: 32px;
  position: relative;
  user-select: none;

  &[data-read-only] {
    cursor: default;
  }

  @media (hover: hover) {
    &[data-read-only]:hover {
      background-color: ${themeCssVariables.background.secondary};
      border-radius: 0px;
      color: ${themeCssVariables.font.color.secondary};
      outline: 1px solid ${themeCssVariables.border.color.medium};

      img {
        opacity: 0.64;
      }

      svg {
        color: ${themeCssVariables.font.color.secondary};
      }
    }
  }
`;

const displayClassName = css`
  align-items: center;
  display: flex;
  height: 100%;
  overflow: hidden;
  padding-left: 8px;
  width: 100%;
`;

const innerClassName = css`
  align-items: center;
  display: flex;
  height: 100%;
  overflow: hidden;
  white-space: nowrap;
  width: 100%;
`;

type RecordTableLeanCellProps = {
  recordField: RecordField;
  recordFieldIndex: number;
  isSelected: boolean;
  isDragging: boolean;
  isRecordTableCellsNonEditable: boolean;
};

export const RecordTableLeanCell = ({
  recordField,
  recordFieldIndex,
  isSelected,
  isDragging,
  isRecordTableCellsNonEditable,
}: RecordTableLeanCellProps) => {
  const { recordId, rowIndex, isRecordReadOnly } =
    useRecordTableRowContextOrThrow();
  const { recordTableId, objectMetadataItem, objectPermissions } =
    useRecordTableContextOrThrow();
  const {
    fieldDefinitionByFieldMetadataItemId,
    fieldMetadataItemByFieldMetadataItemId,
    objectPermissionsByObjectMetadataId,
  } = useRecordIndexContextOrThrow();
  const { onOpenTableCell, openRecordContextMenu } =
    useRecordTableBodyContextOrThrow();
  const updateRecord = useContext(RecordTableUpdateContext);

  const fieldDefinition =
    fieldDefinitionByFieldMetadataItemId[recordField.fieldMetadataItemId];
  const fieldMetadataItem =
    fieldMetadataItemByFieldMetadataItemId[recordField.fieldMetadataItemId];

  const isReadOnly =
    isRecordTableCellsNonEditable ||
    isRecordFieldReadOnly({
      isRecordReadOnly: isRecordReadOnly ?? false,
      objectMetadataId: objectMetadataItem.id,
      fieldMetadataItem,
      fieldDefinition,
      objectPermissionsByObjectMetadataId,
    });

  const handleClick = (event: MouseEvent) => {
    event.stopPropagation();

    if (isReadOnly) {
      return;
    }

    onOpenTableCell({
      cellPosition: { column: recordFieldIndex, row: rowIndex },
      recordId,
      fieldDefinition,
      isReadOnly,
      isNavigating: false,
    });
  };

  const handleContextMenu = (event: MouseEvent) => {
    openRecordContextMenu({ event, recordId });
  };

  return (
    <div
      className={cx(
        'table-cell',
        getRecordTableColumnFieldWidthClassName(recordFieldIndex),
        cellClassName,
      )}
      data-selected={isSelected || undefined}
      data-dragging={isDragging || undefined}
    >
      <div
        className={cx(RECORD_TABLE_CELL_CONTENT_CLASS_NAME, contentClassName)}
        id={getRecordTableCellId(recordTableId, recordFieldIndex, rowIndex)}
        data-record-table-col={recordFieldIndex}
        data-record-table-row={rowIndex}
        data-read-only={isReadOnly || undefined}
      >
        <div
          className={cx(RECORD_TABLE_CELL_DISPLAY_CLASS_NAME, displayClassName)}
          data-testid="editable-cell-display-mode"
          onClick={handleClick}
          onContextMenu={handleContextMenu}
        >
          <div className={innerClassName}>
            <FieldContext.Provider
              value={{
                fieldMetadataItemId: recordField.fieldMetadataItemId,
                recordId,
                fieldDefinition,
                useUpdateRecord: updateRecord
                  ? () => [updateRecord, {}]
                  : undefined,
                isLabelIdentifier: false,
                displayedMaxRows: 1,
                isRecordFieldReadOnly: isReadOnly,
                isForbidden: !objectPermissions.canReadObjectRecords,
              }}
            >
              {isFieldRating(fieldDefinition) &&
              objectPermissions.canReadObjectRecords ? (
                <RatingFieldStaticDisplay />
              ) : (
                <FieldFocusStaticUnfocusedProvider>
                  <FieldDisplay />
                </FieldFocusStaticUnfocusedProvider>
              )}
            </FieldContext.Provider>
          </div>
        </div>
      </div>
    </div>
  );
};
