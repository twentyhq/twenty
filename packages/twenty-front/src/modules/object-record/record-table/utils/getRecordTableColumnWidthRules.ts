import { getRecordTableColumnFieldWidthCSSVariableName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthCSSVariableName';
import { getRecordTableColumnFieldWidthClassName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthClassName';

export const getRecordTableColumnWidthRules = ({
  scopeSelector,
  columnCount,
}: {
  scopeSelector: string;
  columnCount: number;
}) =>
  Array.from({ length: columnCount }, (_, columnIndex) => {
    const columnWidth = `var(${getRecordTableColumnFieldWidthCSSVariableName(columnIndex)})`;

    // CSS source syntax must stay stable across locales.
    // oxlint-disable-next-line lingui/no-unlocalized-strings
    return `${scopeSelector} div.${getRecordTableColumnFieldWidthClassName(columnIndex)} { width: ${columnWidth}; min-width: ${columnWidth}; max-width: ${columnWidth}; }`;
  }).join('\n');
