import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { RECORD_TABLE_COLUMN_MIN_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnMinWidth';
import { RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_WIDTH_ON_MOBILE } from '@/object-record/record-table/constants/RecordTableLabelIdentifierColumnWidthOnMobile';

const sumSizeWithMinWidth = (
  acc: number,
  field: Pick<RecordField, 'size'>,
): number => acc + Math.max(field.size, RECORD_TABLE_COLUMN_MIN_WIDTH);

export const computeVisibleRecordFieldsWidthOnTable = ({
  shouldCompactFirstColumn,
  visibleRecordFields,
}: {
  shouldCompactFirstColumn: boolean;
  visibleRecordFields: Pick<RecordField, 'size'>[];
}) => {
  const visibleRecordFieldsWithoutFirst = visibleRecordFields.slice(1);

  const sumWithoutFirstField = visibleRecordFieldsWithoutFirst.reduce(
    sumSizeWithMinWidth,
    0,
  );

  const sumWithAllFields = visibleRecordFields.reduce(sumSizeWithMinWidth, 0);

  const sumForCompactedFirstColumn =
    RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_WIDTH_ON_MOBILE + sumWithoutFirstField;

  const sumForNoCompactColumn = sumWithAllFields;

  const visibleRecordFieldsWidth = shouldCompactFirstColumn
    ? sumForCompactedFirstColumn
    : sumForNoCompactColumn;

  return {
    visibleRecordFieldsWidth,
  };
};
