import { css, cx } from '@linaria/core';
import { type MouseEvent } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { RECORD_TABLE_CELL_CONTENT_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableCellContentClassName';
import { RECORD_TABLE_CELL_DISPLAY_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableCellDisplayClassName';
import { useRecordTableBodyContextOrThrow } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { getRecordTableCellId } from '@/object-record/record-table/utils/getRecordTableCellId';
import { getRecordTableColumnFieldWidthClassName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthClassName';
import { LinkifiedText } from '@/ui/field/display/components/LinkifiedText/LinkifiedText';
import { linkifyText } from '@/ui/field/display/components/LinkifiedText/linkifyText';

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

const textContainerClassName = css`
  align-items: center;
  display: flex;
  height: 20px;
`;

const textClassName = css`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  cursor: inherit;
  display: -webkit-box;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  height: auto;
  max-width: 100%;
  overflow-wrap: break-word;
  overflow: hidden;
  text-decoration: inherit;
  white-space: pre-wrap;
`;

type RecordTableTextCellProps = {
  recordField: RecordField;
  recordFieldIndex: number;
  isSelected: boolean;
  isDragging: boolean;
  isRecordTableCellsNonEditable: boolean;
};

export const RecordTableTextCell = ({
  recordField,
  recordFieldIndex,
  isSelected,
  isDragging,
  isRecordTableCellsNonEditable,
}: RecordTableTextCellProps) => {
  const { recordId, rowIndex, isRecordReadOnly } =
    useRecordTableRowContextOrThrow();
  const { recordTableId, objectMetadataItem } = useRecordTableContextOrThrow();
  const {
    fieldDefinitionByFieldMetadataItemId,
    fieldMetadataItemByFieldMetadataItemId,
    objectPermissionsByObjectMetadataId,
  } = useRecordIndexContextOrThrow();
  const { onOpenTableCell, openRecordContextMenu } =
    useRecordTableBodyContextOrThrow();

  const fieldDefinition =
    fieldDefinitionByFieldMetadataItemId[recordField.fieldMetadataItemId];
  const fieldMetadataItem =
    fieldMetadataItemByFieldMetadataItemId[recordField.fieldMetadataItemId];

  const text =
    useRecordFieldValue<string>(
      recordId,
      fieldDefinition.metadata.fieldName,
      fieldDefinition,
    ) ?? '';

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

  const hasLink = linkifyText(text).some((part) => part.type === 'link');

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
            <div className={textContainerClassName}>
              <div className={textClassName} dir="auto">
                {hasLink ? <LinkifiedText text={text} /> : text}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
