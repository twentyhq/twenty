import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';

import { getSpreadSheetFieldValidationDefinitions } from '@/object-record/spreadsheet-import/utils/getSpreadSheetFieldValidationDefinitions';
import { getRelationConnectSubFieldKey } from '@/object-record/spreadsheet-import/utils/spreadSheetGetRelationConnectSubFieldKey';
import { getCompositeSubFieldKey } from '@/object-record/spreadsheet-import/utils/spreadsheetImportGetCompositeSubFieldKey';
import { getCompositeSubFieldLabelWithFieldLabel } from '@/object-record/spreadsheet-import/utils/spreadsheetImportGetCompositeSubFieldLabelWithFieldLabel';
import { getRelationConnectSubFieldLabel } from '@/object-record/spreadsheet-import/utils/spreadsheetImportGetRelationConnectSubFieldLabel';
import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import { type CompositeFieldType } from '@/settings/data-model/types/CompositeFieldType';
import {
  type SpreadsheetImportField,
  type SpreadsheetImportFields,
} from '@/spreadsheet-import/types';
import { useRecoilValue } from 'recoil';
import {
  assertUnreachable,
  getUniqueConstraintsFields,
  isDefined,
} from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

export const useBuildSpreadsheetImportFields = () => {
  const { getIcon } = useIcons();
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const buildSpreadsheetImportFields = (
    fieldMetadataItems: FieldMetadataItem[],
  ): SpreadsheetImportFields => {
    return fieldMetadataItems
      .filter((field) => field.type !== FieldMetadataType.ACTOR)
      .flatMap((fieldMetadataItem) =>
        buildSpreadsheetImportField(fieldMetadataItem),
      );
  };

  const buildSpreadsheetImportField = (
    fieldMetadataItem: FieldMetadataItem,
    relationConnectFieldOverrides?: Partial<SpreadsheetImportField>,
  ) => {
    switch (fieldMetadataItem.type) {
      case FieldMetadataType.ADDRESS:
      case FieldMetadataType.CURRENCY:
      case FieldMetadataType.EMAILS:
      case FieldMetadataType.FULL_NAME:
      case FieldMetadataType.LINKS:
      case FieldMetadataType.PHONES:
      case FieldMetadataType.RICH_TEXT_V2:
        return handleCompositeFields({
          fieldMetadataItem,
          fieldType: fieldMetadataItem.type,
        });
      case FieldMetadataType.RELATION:
        return handleRelationField(fieldMetadataItem);
      case FieldMetadataType.SELECT:
      case FieldMetadataType.MULTI_SELECT:
        return [
          handleSelectField(
            fieldMetadataItem,
            fieldMetadataItem.type === FieldMetadataType.MULTI_SELECT,
            relationConnectFieldOverrides,
          ),
        ];
      case FieldMetadataType.BOOLEAN:
        return [
          createBaseField(fieldMetadataItem, {
            fieldType: { type: 'checkbox' },
            ...(isDefined(relationConnectFieldOverrides)
              ? relationConnectFieldOverrides
              : {}),
          }),
        ];
      case FieldMetadataType.DATE_TIME:
      case FieldMetadataType.DATE:
      case FieldMetadataType.NUMBER:
      case FieldMetadataType.NUMERIC:
      case FieldMetadataType.TEXT:
      case FieldMetadataType.UUID:
      case FieldMetadataType.ARRAY:
      case FieldMetadataType.RATING:
      case FieldMetadataType.RAW_JSON:
        return [
          createBaseField(fieldMetadataItem, relationConnectFieldOverrides),
        ];

      case FieldMetadataType.POSITION:
      case FieldMetadataType.MORPH_RELATION:
      case FieldMetadataType.ACTOR:
      case FieldMetadataType.TS_VECTOR:
      case FieldMetadataType.RICH_TEXT:
        return [];

      default:
        return assertUnreachable(fieldMetadataItem.type);
    }
  };

  const createBaseField = (
    fieldMetadataItem: FieldMetadataItem,
    overrides: Partial<SpreadsheetImportField> = {},
  ): SpreadsheetImportField => {
    return {
      Icon: getIcon(fieldMetadataItem.icon),
      label: fieldMetadataItem.label,
      key: fieldMetadataItem.name,
      fieldMetadataItemId: fieldMetadataItem.id,
      fieldType: { type: 'input' },
      fieldMetadataType: fieldMetadataItem.type,
      fieldValidationDefinitions: getSpreadSheetFieldValidationDefinitions(
        fieldMetadataItem.type,
        fieldMetadataItem.label,
      ),
      isNestedField: false,
      ...overrides,
    };
  };

  const handleCompositeFields = ({
    fieldMetadataItem,
    fieldType,
  }: {
    fieldMetadataItem: FieldMetadataItem;
    fieldType: CompositeFieldType;
  }) => {
    const spreadsheetImportFields: SpreadsheetImportField[] = [];

    SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[fieldType].subFields.forEach(
      ({ subFieldName, isImportable, subFieldLabel }) => {
        if (!isImportable) return;
        const label = getCompositeSubFieldLabelWithFieldLabel(
          fieldMetadataItem,
          subFieldLabel,
        );

        spreadsheetImportFields.push(
          createBaseField(fieldMetadataItem, {
            label,
            key: getCompositeSubFieldKey(fieldMetadataItem, subFieldName),
            fieldValidationDefinitions:
              getSpreadSheetFieldValidationDefinitions(
                fieldMetadataItem.type,
                label,
                subFieldName,
              ),
            isNestedField: true,
            isCompositeSubField: true,
            compositeSubFieldKey: subFieldName,
          }),
        );
      },
    );

    return spreadsheetImportFields;
  };

  const handleCompositeFieldFromRelationConnectField = ({
    fieldMetadataItem,
    uniqueConstraintField,
    uniqueConstraintType,
  }: {
    fieldMetadataItem: FieldMetadataItem;
    uniqueConstraintField: FieldMetadataItem;
    uniqueConstraintType: CompositeFieldType;
  }) => {
    const spreadsheetImportFields: SpreadsheetImportField[] = [];

    SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[
      uniqueConstraintType
    ].subFields.forEach(
      ({ subFieldName, isImportable, isIncludedInUniqueConstraint }) => {
        if (!isImportable || !isIncludedInUniqueConstraint) return;

        spreadsheetImportFields.push(
          createBaseField(fieldMetadataItem, {
            label: getRelationConnectSubFieldLabel(
              fieldMetadataItem,
              uniqueConstraintField,
              subFieldName,
            ),
            key: getRelationConnectSubFieldKey(
              fieldMetadataItem,
              uniqueConstraintField,
              subFieldName,
            ),
            fieldValidationDefinitions:
              getSpreadSheetFieldValidationDefinitions(
                uniqueConstraintField.type,
                uniqueConstraintField.name,
                subFieldName,
              ),
            isNestedField: true,
            isCompositeSubField: true,
            compositeSubFieldKey: subFieldName,
            uniqueFieldMetadataItem: uniqueConstraintField,
            isRelationConnectField: true,
          }),
        );
      },
    );

    return spreadsheetImportFields;
  };

  const handleSelectField = (
    fieldMetadataItem: FieldMetadataItem,
    isMulti = false,
    subFieldOverrides?: Record<string, any>,
  ) =>
    createBaseField(fieldMetadataItem, {
      fieldType: {
        type: isMulti ? 'multiSelect' : 'select',
        options:
          fieldMetadataItem.options?.map((option) => ({
            label: option.label,
            value: option.value,
            color: option.color,
          })) || [],
        ...(isDefined(subFieldOverrides) ? subFieldOverrides : {}),
      },
      fieldValidationDefinitions: getSpreadSheetFieldValidationDefinitions(
        fieldMetadataItem.type,
        `${fieldMetadataItem.label} (ID)`,
      ),
    });

  const handleRelationField = (fieldMetadataItem: FieldMetadataItem) => {
    const spreadsheetImportFields: SpreadsheetImportField[] = [];

    const isManyToOneRelation =
      fieldMetadataItem.relation?.type === RelationType.MANY_TO_ONE;

    const targetObjectMetadataItem = objectMetadataItems?.find(
      (objectMetadataItem) =>
        objectMetadataItem.id ===
        fieldMetadataItem.relation?.targetObjectMetadata.id,
    );

    if (isManyToOneRelation && isDefined(targetObjectMetadataItem)) {
      const uniqueConstraintFields = getUniqueConstraintsFields<
        FieldMetadataItem,
        ObjectMetadataItem
      >(targetObjectMetadataItem);

      //todo - update logic when composite unique indexes will be supported
      for (const uniqueConstraintField of uniqueConstraintFields.flat()) {
        if (isCompositeFieldType(uniqueConstraintField.type)) {
          spreadsheetImportFields.push(
            ...handleCompositeFieldFromRelationConnectField({
              fieldMetadataItem,
              uniqueConstraintField,
              uniqueConstraintType: uniqueConstraintField.type,
            }),
          );
        } else {
          spreadsheetImportFields.push(
            ...buildSpreadsheetImportField(uniqueConstraintField, {
              Icon: getIcon(fieldMetadataItem.icon),
              isNestedField: true,
              isCompositeSubField: false,
              isRelationConnectField: true,
              fieldMetadataItemId: fieldMetadataItem.id,
              fieldMetadataType: FieldMetadataType.RELATION,
              uniqueFieldMetadataItem: uniqueConstraintField,
              label: getRelationConnectSubFieldLabel(
                fieldMetadataItem,
                uniqueConstraintField,
              ),
              key: getRelationConnectSubFieldKey(
                fieldMetadataItem,
                uniqueConstraintField,
              ),
            }),
          );
        }
      }
    }

    return spreadsheetImportFields;
  };

  return { buildSpreadsheetImportFields };
};
