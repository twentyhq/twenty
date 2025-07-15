import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { getSubFieldOptionKey } from '@/object-record/spreadsheet-import/utils/getSubFieldOptionKey';
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
  const uniqueConstraints = objectMetadataItem.indexMetadatas.filter(
    (indexMetadata) => indexMetadata.isUnique,
  );

  const uniqueConstraintsWithColumnNames: Column[][] = [
    [{ columnName: 'id', fieldType: FieldMetadataType.UUID }],
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

          return uniqueSubFields.map((subField) => ({
            columnName: getSubFieldOptionKey(field, subField.subFieldName),
            fieldType: field.type,
          }));
        }

        return [{ columnName: field.name, fieldType: field.type }];
      }),
    ),
  ];

  const rowHook: SpreadsheetImportRowHook<string> = (row, addError, table) => {
    if (uniqueConstraints.length === 0) {
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
  row: ImportedStructuredRow<string>,
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
