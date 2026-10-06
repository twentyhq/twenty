import { assertDataResultLimit } from '@/data/assert-data-result-limit';
import { formatDataCell } from '@/data/format-data-value';
import { type readDataListOptions } from '@/data/read-data-list-options';
import { type DataPage, type DataRecord } from '@/data/types/data-page.type';
import { TABLE_LAYOUT } from '@/output/constants/table-layout.constant';
import { formatTable } from '@/output/format-table';

const PRIORITIZED_TABLE_FIELDS = ['id', 'name'];

const HIDDEN_DEFAULT_TABLE_FIELDS = new Set(['deletedAt']);

const getDataCell = (record: DataRecord, field: string) =>
  formatDataCell(Object.hasOwn(record, field) ? record[field] : undefined);

export const formatDataPage = ({
  page,
  options,
}: {
  page: DataPage;
  options: ReturnType<typeof readDataListOptions>;
}) => {
  const availableFields = Object.keys(page.records[0] ?? {});
  const fields =
    options.fields ??
    [
      ...PRIORITIZED_TABLE_FIELDS.filter((field) =>
        availableFields.includes(field),
      ),
      ...availableFields.filter(
        (field) =>
          !PRIORITIZED_TABLE_FIELDS.includes(field) &&
          !HIDDEN_DEFAULT_TABLE_FIELDS.has(field),
      ),
    ].slice(0, 5);

  let rowWidth = TABLE_LAYOUT.ROW_INDENT.length;
  let extraBytes = 0;

  for (const field of fields) {
    const header = formatDataCell(field);
    let columnWidth = header.length;

    extraBytes += Buffer.byteLength(header, 'utf8') - header.length;

    for (const record of page.records) {
      const cell = getDataCell(record, field);

      columnWidth = Math.max(columnWidth, cell.length);
      extraBytes += Buffer.byteLength(cell, 'utf8') - cell.length;
    }

    rowWidth += columnWidth + TABLE_LAYOUT.COLUMN_GAP.length;
  }

  assertDataResultLimit({
    recordCount: page.records.length,
    bytes: rowWidth * (page.records.length + 1) + extraBytes,
  });
  const table =
    page.records.length === 0
      ? 'No records.'
      : formatTable({
          rows: page.records,
          columns: fields.map((field) => ({
            header: formatDataCell(field),
            value: (record: DataRecord) => getDataCell(record, field),
          })),
        });
  const footer = `${page.records.length} of ${page.totalCount} records`;

  return page.pageInfo.hasNextPage
    ? `${table}\n${footer} · --all for every page · --json for the next cursor`
    : `${table}\n${footer}`;
};
