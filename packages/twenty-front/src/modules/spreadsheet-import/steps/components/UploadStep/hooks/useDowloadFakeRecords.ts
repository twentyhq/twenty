import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { filterAvailableFieldMetadataItemsToImport } from '@/object-record/spreadsheet-import/utils/filterAvailableFieldMetadataItemsToImport';
import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import { SETTINGS_NON_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsNonCompositeFieldTypeConfigs';
import { isString } from '@sniptt/guards';
import { saveAs } from 'file-saver';
import { FieldMetadataType } from 'twenty-shared/types';

export const useDowloadFakeRecords = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const availableFieldMetadataItems = filterAvailableFieldMetadataItemsToImport(
    objectMetadataItem.fields,
  );

  const downloadSample = () => {
    const columns: string[] = [];
    const rows: string[] = [];

    availableFieldMetadataItems.forEach((field) => {
      switch (field.type) {
        case FieldMetadataType.RATING:
        case FieldMetadataType.ARRAY:
        case FieldMetadataType.UUID:
        case FieldMetadataType.DATE_TIME:
        case FieldMetadataType.DATE:
        case FieldMetadataType.BOOLEAN:
        case FieldMetadataType.TEXT:
          columns.push(field.label);
          rows.push(
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

          columns.push(
            ...subFields.map(
              (subField: string) =>
                `${field.label} / ${compositeFieldSettings.labelBySubField[subField as keyof typeof compositeFieldSettings.labelBySubField]}`,
            ),
          );
          rows.push(
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
          columns.push(`${field.label} Id`);
          rows.push('00000000-0000-0000-0000-000000000000');
          break;

        case FieldMetadataType.MULTI_SELECT:
          columns.push(field.label);
          rows.push(
            JSON.stringify(
              field?.options?.map((option) => option?.value) || [],
            ),
          );
          break;

        case FieldMetadataType.SELECT:
          columns.push(field.label);
          rows.push(field?.options?.[0]?.value || '');
          break;
      }
    });

    const escapedRows = rows.map((value) => {
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

    const csvContent = [columns.join(','), escapedRows.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    saveAs(blob, `${objectMetadataItem.labelPlural.toLowerCase()}-sample.csv`);
  };

  return { downloadSample };
};
