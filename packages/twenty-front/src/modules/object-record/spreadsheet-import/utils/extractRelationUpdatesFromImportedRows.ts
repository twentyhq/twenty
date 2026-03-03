import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  type SpreadsheetImportField,
  type SpreadsheetImportFields,
} from '@/spreadsheet-import/types';
import { type ImportedStructuredRow } from '@/spreadsheet-import/types';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isEmptyObject } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { castToString } from '~/utils/castToString';
import { convertCurrencyAmountToCurrencyMicros } from '~/utils/convertCurrencyToCurrencyMicros';

export type RelationUpdateEntry = {
  targetObjectMetadataItem: ObjectMetadataItem;
  updateRecords: Record<string, any>[];
};

const COMPOSITE_FIELD_TRANSFORM_CONFIGS: Partial<
  Record<FieldMetadataType, Record<string, ((value: any) => any) | undefined>>
> = {
  [FieldMetadataType.CURRENCY]: {
    amountMicros: (value: any) =>
      convertCurrencyAmountToCurrencyMicros(Number(value)),
    currencyCode: undefined,
  },
  [FieldMetadataType.ADDRESS]: {
    addressStreet1: castToString,
    addressStreet2: castToString,
    addressCity: castToString,
    addressPostcode: castToString,
    addressState: castToString,
    addressCountry: castToString,
  },
  [FieldMetadataType.FULL_NAME]: {
    firstName: undefined,
    lastName: undefined,
  },
};

type ReadonlySpreadsheetImportField = Readonly<SpreadsheetImportField>;

type RelationGroup = {
  relationFieldName: string;
  targetObjectMetadataItem: ObjectMetadataItem | undefined;
  updateFields: ReadonlySpreadsheetImportField[];
  connectIdFieldKey: string | undefined;
};

const buildRelationGroups = (
  updateFields: ReadonlySpreadsheetImportField[],
  fieldMetadataItems: FieldMetadataItem[],
  objectMetadataItems: ObjectMetadataItem[],
  allSpreadsheetFields: SpreadsheetImportFields,
): Map<string, RelationGroup> => {
  const groups = new Map<string, RelationGroup>();

  for (const field of updateFields) {
    const relationField = fieldMetadataItems.find(
      (f) => f.id === field.fieldMetadataItemId,
    );
    if (!isDefined(relationField)) continue;

    const relationName = relationField.name;
    if (!groups.has(relationName)) {
      const targetObjectMetadataItem = objectMetadataItems.find(
        (obj) =>
          obj.id === relationField.relation?.targetObjectMetadata.id,
      );

      // Find the connect field for "id" on this relation
      const idConnectField = allSpreadsheetFields.find(
        (f) =>
          f.isRelationConnectField === true &&
          f.fieldMetadataItemId === field.fieldMetadataItemId &&
          f.uniqueFieldMetadataItem?.name === 'id',
      );

      groups.set(relationName, {
        relationFieldName: relationName,
        targetObjectMetadataItem,
        updateFields: [],
        connectIdFieldKey: idConnectField?.key,
      });
    }
    groups.get(relationName)!.updateFields.push(field);
  }

  return groups;
};

const buildUpdateRecordFromField = (
  field: ReadonlySpreadsheetImportField,
  rawValue: any,
): { fieldName: string; subFieldKey?: string; value: any } | undefined => {
  const targetField = field.targetFieldMetadataItem;
  if (!isDefined(targetField)) return undefined;

  if (field.isCompositeSubField && isDefined(field.compositeSubFieldKey)) {
    const transformConfig =
      COMPOSITE_FIELD_TRANSFORM_CONFIGS[targetField.type];
    const transform = transformConfig?.[field.compositeSubFieldKey];
    const value = transform ? transform(rawValue) : rawValue;

    return {
      fieldName: targetField.name,
      subFieldKey: field.compositeSubFieldKey,
      value,
    };
  }

  let value = rawValue;
  switch (targetField.type) {
    case FieldMetadataType.BOOLEAN:
      value = rawValue === 'true' || rawValue === true;
      break;
    case FieldMetadataType.NUMBER:
    case FieldMetadataType.NUMERIC:
      value = Number(rawValue);
      break;
    case FieldMetadataType.DATE:
    case FieldMetadataType.DATE_TIME:
      value = new Date(rawValue).toISOString();
      break;
    default:
      break;
  }

  return { fieldName: targetField.name, value };
};

export const extractRelationUpdatesFromImportedRows = ({
  importedStructuredRows,
  spreadsheetImportFields,
  fieldMetadataItems,
  objectMetadataItems,
}: {
  importedStructuredRows: ImportedStructuredRow[];
  spreadsheetImportFields: SpreadsheetImportFields;
  fieldMetadataItems: FieldMetadataItem[];
  objectMetadataItems: ObjectMetadataItem[];
}): RelationUpdateEntry[] => {
  const updateFields = spreadsheetImportFields.filter(
    (field): field is ReadonlySpreadsheetImportField =>
      field.isRelationUpdateField === true,
  );

  if (updateFields.length === 0) return [];

  const relationGroups = buildRelationGroups(
    updateFields,
    fieldMetadataItems,
    objectMetadataItems,
    spreadsheetImportFields,
  );

  const result: RelationUpdateEntry[] = [];

  for (const [, group] of relationGroups) {
    if (
      !isDefined(group.targetObjectMetadataItem) ||
      !isDefined(group.connectIdFieldKey)
    ) {
      continue;
    }

    const updateRecords: Record<string, any>[] = [];

    for (const row of importedStructuredRows) {
      const recordId = row[group.connectIdFieldKey];
      if (!isDefined(recordId) || !isNonEmptyString(recordId)) continue;

      const record: Record<string, any> = { id: recordId };

      for (const field of group.updateFields) {
        const rawValue = row[field.key];
        if (!isDefined(rawValue) || !isNonEmptyString(String(rawValue))) {
          continue;
        }

        const result = buildUpdateRecordFromField(field, rawValue);
        if (!isDefined(result)) continue;

        if (isDefined(result.subFieldKey)) {
          record[result.fieldName] = {
            ...(isDefined(record[result.fieldName])
              ? record[result.fieldName]
              : {}),
            [result.subFieldKey]: result.value,
          };
        } else {
          record[result.fieldName] = result.value;
        }
      }

      if (!isEmptyObject(record) && Object.keys(record).length > 1) {
        updateRecords.push(record);
      }
    }

    if (updateRecords.length > 0) {
      result.push({
        targetObjectMetadataItem: group.targetObjectMetadataItem,
        updateRecords,
      });
    }
  }

  return result;
};
