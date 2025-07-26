import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { getCompositeSubFieldKey } from '@/object-record/spreadsheet-import/utils/spreadsheetImportGetCompositeSubFieldKey';
import { COMPOSITE_FIELD_SUB_FIELD_LABELS } from '@/settings/data-model/constants/CompositeFieldSubFieldLabel';
import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import {
  ImportedStructuredRow,
  SpreadsheetImportRowHook,
} from '@/spreadsheet-import/types';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  getUniqueConstraintsFields,
  isDefined,
  lowercaseUrlOriginAndRemoveTrailingSlash,
} from 'twenty-shared/utils';

type Column = {
  columnName: string;
  fieldType: FieldMetadataType;
};

export const spreadsheetImportGetUnicityRowHook = (
  objectMetadataItem: ObjectMetadataItem,
) => {
  const uniqueConstraintsFields = getUniqueConstraintsFields<
    FieldMetadataItem,
    ObjectMetadataItem
  >(objectMetadataItem);

  const uniqueConstraintsWithColumnNames: Column[][] =
    uniqueConstraintsFields.map((uniqueConstraintFields) =>
      uniqueConstraintFields.flatMap((field) => {
        if (isCompositeFieldType(field.type)) {
          const compositeTypeFieldConfig =
            SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[field.type];

          const uniqueSubFields = compositeTypeFieldConfig.subFields.filter(
            (subField) => subField.isIncludedInUniqueConstraint,
          );

          return uniqueSubFields.map((subField) => ({
            columnName: getCompositeSubFieldKey(field, subField.subFieldName),
            fieldType: field.type,
          }));
        }

        return [{ columnName: field.name, fieldType: field.type }];
      }),
    );
  const rowHook: SpreadsheetImportRowHook = (row, addError, table) => {
    if (uniqueConstraintsFields.length === 0) {
      return row;
    }

    uniqueConstraintsWithColumnNames.forEach((uniqueConstraint) => {
      const rowUniqueValues = getUniqueValues(row, uniqueConstraint);

      if (!isNonEmptyString(rowUniqueValues)) {
        return row;
      }

      const duplicateRows = table.filter(
        (r) => getUniqueValues(r, uniqueConstraint) === rowUniqueValues,
      );

      if (duplicateRows.length <= 1) {
        return row;
      }

      uniqueConstraint.forEach(({ columnName }) => {
        if (isDefined(row[columnName])) {
          addError(columnName, {
            message: t`This ${columnName} value already exists in your import data`,
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
  row: ImportedStructuredRow,
  uniqueConstraint: Column[],
) => {
  return uniqueConstraint
    .map(({ columnName, fieldType }) => {
      // need to ensure the primary link url is processed before import as on server side
      if (
        fieldType === FieldMetadataType.LINKS &&
        columnName.includes(
          COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.LINKS]
            .primaryLinkUrl,
        )
      ) {
        return lowercaseUrlOriginAndRemoveTrailingSlash(
          row?.[columnName]?.toString().trim() || '',
        );
      }

      return row?.[columnName]?.toString().trim().toLowerCase();
    })
    .join('');
};
