import { getRecordTableColumnFieldWidthCSSVariableName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthCSSVariableName';
import { getRecordTableColumnFieldWidthClassName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthClassName';
import { doNotTranslate } from 'twenty-shared/i18n';

export const getRecordTableColumnWidthRules = ({
  scopeSelector,
  columnCount,
}: {
  scopeSelector: string;
  columnCount: number;
}) =>
  Array.from({ length: columnCount }, (_, columnIndex) => {
    const columnWidth = `var(${getRecordTableColumnFieldWidthCSSVariableName(columnIndex)})`;

    return doNotTranslate(
      `${scopeSelector} div.${getRecordTableColumnFieldWidthClassName(columnIndex)} { width: ${columnWidth}; min-width: ${columnWidth}; max-width: ${columnWidth}; }`,
    );
  }).join('\n');
