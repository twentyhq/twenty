import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { getSubFieldOptionKey } from '@/object-record/spreadsheet-import/utils/getSubFieldOptionKey';
import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import {
  ImportedStructuredRow,
  SpreadsheetImportRowHook,
} from '@/spreadsheet-import/types';
import { isDefined } from 'twenty-shared/utils';

export const spreadsheetImportGetUnicityRowHook = (
  objectMetadataItem: ObjectMetadataItem,
) => {
  const uniqueConstraints = objectMetadataItem.indexMetadatas.filter(
    (indexMetadata) => indexMetadata.isUnique,
  );

  const uniqueConstraintFields = [
    ['id'],
    ...uniqueConstraints.map((indexMetadata) =>
      indexMetadata.indexFieldMetadatas.flatMap((indexField) => {
        const field = objectMetadataItem.fields.find(
          (objectField) => objectField.id === indexField.fieldMetadataId,
        );

        if (!field) {
          return [];
        }

        if (isCompositeFieldType(field.type)) {
          const compositeTypeFieldConfig =
            SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[field.type];

          const uniqueSubFields = compositeTypeFieldConfig.subFields.filter(
            (subField) => subField.isIncludedInUniqueConstraint,
          );

          return uniqueSubFields.map((subField) =>
            getSubFieldOptionKey(field, subField.subFieldName),
          );
        }

        return [field.name];
      }),
    ),
  ];

  const rowHook: SpreadsheetImportRowHook<string> = (row, addError, table) => {
    if (uniqueConstraints.length === 0) {
      return row;
    }

    uniqueConstraintFields.forEach((uniqueConstraint) => {
      const rowUniqueValues = getUniqueValues(row, uniqueConstraint);

      const duplicateRows = table.filter(
        (r) => getUniqueValues(r, uniqueConstraint) === rowUniqueValues,
      );

      if (duplicateRows.length <= 1) {
        return row;
      }

      uniqueConstraint.forEach((field) => {
        if (isDefined(row[field])) {
          addError(field, {
            message: `This ${field} value already exists in your import data`,
            level: 'error',
          });
        }
      });
    });

    return row;
  };

  return rowHook;
};

const getUniqueValues = (
  row: ImportedStructuredRow<string>,
  uniqueConstraint: string[],
) => {
  return uniqueConstraint
    .map((field) => row?.[field]?.toString().trim().toLowerCase())
    .join('');
};
