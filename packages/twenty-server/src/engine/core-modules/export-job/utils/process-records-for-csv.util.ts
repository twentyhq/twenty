import { json2csv } from 'json-2-csv';

type ExportColumn = {
  fieldName: string;
  label: string;
  type: string;
};

/**
 * Convert currency micros to currency amounts (divide by 1_000_000).
 */
function convertAmountMicros(micros: unknown): number | null {
  if (typeof micros !== 'number') return null;

  return micros / 1_000_000;
}

/**
 * Sanitize a string value for CSV export (prevent formula injection).
 */
function sanitizeForCSV(value: string): string {
  if (/^[=+\-@\t\r]/.test(value)) {
    return `'${value}`;
  }

  return value;
}

/**
 * Process raw workspace records into a shape suitable for CSV columns.
 * Mirrors the frontend useExportProcessRecordsForCSV logic.
 */
export function processRecordsForCSV(
  records: Record<string, unknown>[],
  columns: ExportColumn[],
): Record<string, unknown>[] {
  const columnsByFieldName = new Map(columns.map((c) => [c.fieldName, c]));

  return records.map((record) => {
    const processed: Record<string, unknown> = {};

    // Always include id
    processed['id'] = record['id'];

    for (const col of columns) {
      const value = record[col.fieldName];

      if (value === undefined || value === null) {
        processed[col.fieldName] = '';
        continue;
      }

      switch (col.type) {
        case 'CURRENCY': {
          const data = value as Record<string, unknown>;
          const amount = convertAmountMicros(data?.amountMicros);

          processed[col.fieldName] = {
            amountMicros: amount ?? '',
            currencyCode: data?.currencyCode ?? '',
          };
          break;
        }

        case 'MULTI_SELECT':
        case 'ARRAY':
        case 'RAW_JSON':
        case 'FILES':
          processed[col.fieldName] =
            typeof value === 'string' ? value : JSON.stringify(value);
          break;

        case 'RELATION': {
          // For relations, extract the label identifier (name, title, etc.)
          const related = value as Record<string, unknown> | null;

          if (!related) {
            processed[col.fieldName] = '';
            break;
          }

          // Try common label fields
          const label =
            related.name ??
            related.title ??
            (related.firstName || related.lastName
              ? `${related.firstName ?? ''} ${related.lastName ?? ''}`.trim()
              : related.id ?? '');

          processed[col.fieldName] = label;
          break;
        }

        default: {
          if (typeof value === 'string') {
            processed[col.fieldName] = sanitizeForCSV(value);
          } else if (typeof value === 'object') {
            // Composite fields (PHONES, EMAILS, FULL_NAME, LINKS, ADDRESS)
            // Flatten sub-fields
            const obj = value as Record<string, unknown>;

            for (const [subKey, subValue] of Object.entries(obj)) {
              if (subKey === '__typename') continue;
              processed[`${col.fieldName}.${subKey}`] =
                typeof subValue === 'string'
                  ? sanitizeForCSV(subValue)
                  : (subValue ?? '');
            }
            break;
          } else {
            processed[col.fieldName] = value;
          }
        }
      }
    }

    return processed;
  });
}

/**
 * Generate a CSV string from processed records and column definitions.
 */
export function generateCSVFromRecords(
  records: Record<string, unknown>[],
  columns: ExportColumn[],
): string {
  if (records.length === 0) {
    return '';
  }

  const processedRecords = processRecordsForCSV(records, columns);

  // Build keys from the first processed record to capture flattened composite fields
  const firstRecord = processedRecords[0];
  const keys = Object.keys(firstRecord).map((field) => {
    // Find the column for this field to get label
    const col = columns.find((c) => c.fieldName === field);

    return {
      field,
      title: col ? sanitizeForCSV(col.label) : field,
    };
  });

  return json2csv(processedRecords, {
    keys,
    emptyFieldValue: '',
  });
}
