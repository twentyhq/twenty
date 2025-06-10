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
    const row: string[] = [];

    availableFieldMetadataItems.forEach((field) => {
      switch (field.type) {
        case FieldMetadataType.RATING:
        case FieldMetadataType.ARRAY:
        case FieldMetadataType.UUID:
        case FieldMetadataType.DATE_TIME:
        case FieldMetadataType.DATE:
        case FieldMetadataType.BOOLEAN:
        case FieldMetadataType.TEXT:
          headerRow.push(field.label);
          row.push(
            SETTINGS_NON_COMPOSITE_FIELD_TYPE_CONFIGS[field.type]
              .exampleValue || '',
          );
          break;
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

          headerRow.push(
            ...subFields.map(
              (subField: string) =>
                `${field.label} / ${compositeFieldSettings.labelBySubField[subField as keyof typeof compositeFieldSettings.labelBySubField]}`,
            ),
          );
          row.push(
            ...subFields.map((subField: string) => {
              const value =
                compositeFieldSettings.exampleValue[
                  subField as keyof typeof compositeFieldSettings.exampleValue
                ];
              return value || '';
            }),
          );

          break;
        }

        case FieldMetadataType.RELATION:
          headerRow.push(`${field.label} Id`);
          row.push('00000000-0000-0000-0000-000000000000');
          break;

        case FieldMetadataType.MULTI_SELECT:
          headerRow.push(field.label);
          row.push(
            JSON.stringify(
              field?.options?.map((option) => option?.value) || [],
            ),
          );
          break;

        case FieldMetadataType.SELECT:
          headerRow.push(field.label);
          row.push(field?.options?.[0]?.value || '');
          break;
      }
    });

    return { headerRow, bodyRows: [row] };
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
