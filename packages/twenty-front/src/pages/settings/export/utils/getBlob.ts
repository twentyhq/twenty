import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import { json2csv } from 'json-2-csv';
import { CompositeField } from '~/pages/settings/export/types/compositeField';
import { ExportObjectItem } from '~/pages/settings/export/types/exportObjectItem';

export const removeTypename = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(removeTypename);
  if (typeof obj === 'object') {
    const cleaned: any = {};
    Object.keys(obj).forEach((key) => {
      if (key !== '__typename') {
        cleaned[key] = removeTypename(obj[key]);
      }
    });
    return cleaned;
  }
  return obj;
};

export const cleanDataForCsv = (
  records: any[],
  compositeFields: CompositeField[],
): any[] => {
  return records.map((record) => {
    const cleanRecord: any = {};
    Object.keys(record).forEach((key) => {
      if (key !== '__typename') {
        const isCompositeField = compositeFields.some((cf) => cf.name === key);
        if (!isCompositeField) {
          const value = removeTypename(record[key]);
          cleanRecord[key] = value === null || value === undefined ? '' : value;
        } else {
          const compositeConfig = compositeFields.find((cf) => cf.name === key);
          if (compositeConfig !== undefined && record[key] !== null) {
            compositeConfig.subFields.forEach((subField) => {
              const value = record[key][subField];
              cleanRecord[`${key}.${subField}`] =
                value === null || value === undefined
                  ? ''
                  : Array.isArray(value)
                    ? JSON.stringify(value)
                    : value;
            });
          } else if (compositeConfig !== undefined) {
            compositeConfig.subFields.forEach((subField) => {
              cleanRecord[`${key}.${subField}`] = '';
            });
          }
        }
      }
    });
    return cleanRecord;
  });
};

export const getSubFieldType = (
  parentType: string,
  subFieldName: string,
): string => {
  const subFieldTypeMap: Record<string, Record<string, string>> = {
    FULL_NAME: { firstName: 'TEXT', lastName: 'TEXT' },
    ADDRESS: {
      street: 'TEXT',
      city: 'TEXT',
      state: 'TEXT',
      postalCode: 'TEXT',
      country: 'TEXT',
    },
    CURRENCY: { amount: 'NUMBER', currency: 'TEXT' },
  };
  return subFieldTypeMap[parentType]?.[subFieldName] || 'TEXT';
};

export const buildFieldMetadata = (fields: any[]) =>
  fields.map((field) => {
    const compositeConfig =
      SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[
        field.type as keyof typeof SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS
      ];
    if (compositeConfig !== undefined) {
      return {
        name: field.name,
        type: field.type,
        isComposite: true,
        subFields: compositeConfig.subFields.map((subField) => ({
          name: subField,
          type: getSubFieldType(field.type, subField),
          fullName: `${field.name}.${subField}`,
        })),
      };
    }
    return { name: field.name, type: field.type, isComposite: false };
  });

export const getBlob = async (
  format: 'csv' | 'json',
  rawRecords: any[],
  compositeFields: CompositeField[],
  preserveTypes: boolean,
  item: ExportObjectItem,
  fieldTypes: any[],
): Promise<Blob> => {
  if (format === 'csv') {
    const cleanedRecords = cleanDataForCsv(rawRecords, compositeFields);
    const csv = await json2csv(cleanedRecords);
    return new Blob([csv], { type: 'text/csv;charset=utf-8' });
  }

  if (format === 'json') {
    const cleanedRecords = preserveTypes
      ? rawRecords
      : rawRecords.map(removeTypename);
    const jsonData = preserveTypes
      ? {
          metadata: {
            objectName: item.name,
            labelPlural: item.labelPlural,
            exportDate: new Date().toISOString(),
            fieldsCount: item.fieldsCount,
            recordsCount: rawRecords.length,
            preserveTypes: true,
            version: '1.0',
            fields: [
              { name: 'id', type: 'UUID', isComposite: false },
              { name: 'createdAt', type: 'DATE_TIME', isComposite: false },
              { name: 'updatedAt', type: 'DATE_TIME', isComposite: false },
              ...buildFieldMetadata(fieldTypes),
            ],
          },
          data: cleanedRecords,
        }
      : cleanedRecords;
    return new Blob([JSON.stringify(jsonData, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
  }
  throw new Error(`Unsupported format: ${format}`);
};
