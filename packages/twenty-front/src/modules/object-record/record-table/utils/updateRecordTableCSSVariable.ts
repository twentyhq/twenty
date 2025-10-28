import { RECORD_TABLE_HTML_ID } from '@/object-record/record-table/constants/RecordTableHtmlId';

export const updateRecordTableCSSVariable = (
  cssVariableName: string,
  newValue: string,
) => {
  document
    .querySelector<HTMLDivElement>(`#${RECORD_TABLE_HTML_ID}`)
    ?.style.setProperty(cssVariableName, newValue);
};
