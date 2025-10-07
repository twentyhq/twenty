import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { spreadsheetImportFilterAvailableFieldMetadataItems } from '@/object-record/spreadsheet-import/utils/spreadsheetImportFilterAvailableFieldMetadataItems';
import { getCompositeSubFieldLabelWithFieldLabel } from '@/object-record/spreadsheet-import/utils/spreadsheetImportGetCompositeSubFieldLabelWithFieldLabel';
import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import { SETTINGS_NON_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsNonCompositeFieldTypeConfigs';
import { formatValueForCSV } from '@/spreadsheet-import/utils/formatValueForCSV';
import { sanitizeValueForCSVExport } from '@/spreadsheet-import/utils/sanitizeValueForCSVExport';
import { saveAs } from 'file-saver';
import { FieldMetadataType } from 'twenty-shared/types';

export const useDownloadFakeRecords = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const availableFieldMetadataItems =
    spreadsheetImportFilterAvailableFieldMetadataItems(
      objectMetadataItem.updatableFields,
    );

  const buildTableWithFakeRecords = () => {
    const headerRow: string[] = [];
    const bodyRows: string[][] = [[], [], []];

    availableFieldMetadataItems.forEach((field) => {
      switch (field.type) {
        case FieldMetadataType.RATING:
        case FieldMetadataType.ARRAY:
        case FieldMetadataType.RAW_JSON:
        case FieldMetadataType.UUID:
        case FieldMetadataType.DATE_TIME:
        case FieldMetadataType.DATE:
        case FieldMetadataType.BOOLEAN:
        case FieldMetadataType.NUMBER:
        case FieldMetadataType.TEXT: {
          headerRow.push(field.label);
          const exampleValues =
            SETTINGS_NON_COMPOSITE_FIELD_TYPE_CONFIGS[field.type].exampleValues;

          bodyRows.forEach((_, index) => {
            bodyRows[index].push(exampleValues?.[index] || '');
          });

          break;
        }
        case FieldMetadataType.RICH_TEXT_V2:
        case FieldMetadataType.ACTOR:
        case FieldMetadataType.EMAILS:
        case FieldMetadataType.CURRENCY:
        case FieldMetadataType.FULL_NAME:
        case FieldMetadataType.LINKS:
        case FieldMetadataType.PHONES:
        case FieldMetadataType.ADDRESS: {
          const compositeFieldSettings =
            SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[field.type];

          const subFields = compositeFieldSettings.subFields.filter(
            (subField) => subField.isImportable,
          );

          const exampleValues =
            SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[field.type].exampleValues;

          headerRow.push(
            ...subFields.map(({ subFieldLabel }) =>
              getCompositeSubFieldLabelWithFieldLabel(field, subFieldLabel),
            ),
          );

          bodyRows.forEach((_, index) => {
            subFields.forEach(({ subFieldName }) => {
              bodyRows[index].push(
                exampleValues?.[index]?.[
                  subFieldName as keyof (typeof exampleValues)[typeof index]
                ] || '',
              );
            });
          });

          break;
        }

        case FieldMetadataType.RELATION: {
          headerRow.push(`${field.label} (ID)`);

          const exampleValues =
            SETTINGS_NON_COMPOSITE_FIELD_TYPE_CONFIGS[FieldMetadataType.UUID]
              .exampleValues;

          bodyRows.forEach((_, index) => {
            bodyRows[index].push(exampleValues?.[index] || '');
          });

          break;
        }

        case FieldMetadataType.MULTI_SELECT:
          headerRow.push(field.label);

          bodyRows.forEach((_, index) => {
            bodyRows[index].push(
              JSON.stringify(
                field?.options
                  ?.map((option) => option?.value)
                  .slice(0, index) || [],
              ),
            );
          });

          break;

        case FieldMetadataType.SELECT:
          headerRow.push(field.label);

          bodyRows.forEach((_, index) => {
            bodyRows[index].push(field?.options?.[index]?.value || '');
          });

          break;
      }
    });

    return { headerRow, bodyRows };
  };

  const formatToCsvContent = (rows: (string | JSON | string[])[][]) => {
    const escapedRows = rows.map((row) => {
      return row.map((value) => {
        const stringifiedValue =
          typeof value === 'string' ? value : JSON.stringify(value);
        return formatValueForCSV(sanitizeValueForCSVExport(stringifiedValue));
      });
    });

    const csvContent = escapedRows.map((row) => row.join(',')).join('\n');
    return [csvContent];
  };

  const downloadSample = () => {
    const { headerRow, bodyRows } = buildTableWithFakeRecords();
    const csvContent = formatToCsvContent([headerRow, ...bodyRows]);
    const blob = new Blob(csvContent, { type: 'text/csv' });
    saveAs(blob, `${objectMetadataItem.labelPlural.toLowerCase()}-sample.csv`);
  };

  return { downloadSample };
};
