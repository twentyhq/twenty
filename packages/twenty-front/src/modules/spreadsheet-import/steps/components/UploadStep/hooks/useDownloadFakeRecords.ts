import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { filterAvailableFieldMetadataItemsToImport } from '@/object-record/spreadsheet-import/utils/filterAvailableFieldMetadataItemsToImport';
import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import { SETTINGS_NON_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsNonCompositeFieldTypeConfigs';
import { isString } from '@sniptt/guards';
import { saveAs } from 'file-saver';
import { FieldMetadataType } from 'twenty-shared/types';

export const useDownloadFakeRecords = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const availableFieldMetadataItems = filterAvailableFieldMetadataItemsToImport(
    objectMetadataItem.fields,
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
        case FieldMetadataType.ACTOR:
        case FieldMetadataType.EMAILS:
        case FieldMetadataType.CURRENCY:
        case FieldMetadataType.FULL_NAME:
        case FieldMetadataType.LINKS:
        case FieldMetadataType.PHONES:
        case FieldMetadataType.ADDRESS: {
          const compositeFieldSettings =
            SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[field.type];
          const subFields =
            'importableSubFields' in compositeFieldSettings
              ? compositeFieldSettings.importableSubFields
              : compositeFieldSettings.subFields;

          const exampleValues =
            SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[field.type].exampleValues;

          headerRow.push(
            ...subFields.map(
              (subField: string) =>
                `${field.label} / ${compositeFieldSettings.labelBySubField[subField as keyof typeof compositeFieldSettings.labelBySubField]}`,
            ),
          );

          bodyRows.forEach((_, index) => {
            subFields.forEach((subField: string) => {
              bodyRows[index].push(
                exampleValues?.[index]?.[
                  subField as keyof (typeof exampleValues)[typeof index]
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

  const formatToCsvContent = (rows: string[][]) => {
    const escapedRows = rows.map((row) => {
      return row.map((value) => {
        if (value == null) return '';

        const stringValue = isString(value) ? value : JSON.stringify(value);

        if (
          stringValue.includes(',') ||
          stringValue.includes('"') ||
          stringValue.includes('\n') ||
          stringValue.includes('\r')
        ) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }

        return stringValue;
      });
    });

    const csvContent = [...escapedRows.map((row) => row.join(','))].join('\n');
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
