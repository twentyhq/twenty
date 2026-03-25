import { getRecordTableHtmlId } from '@/object-record/record-table/utils/getRecordTableHtmlId';

export const updateRecordTableCSSVariable = (
  recordTableId: string,
  cssVariableName: string,
  newValue: string,
) => {
  document
    .querySelector<HTMLDivElement>(`#${getRecordTableHtmlId(recordTableId)}`)
    ?.style.setProperty(cssVariableName, newValue);
};
