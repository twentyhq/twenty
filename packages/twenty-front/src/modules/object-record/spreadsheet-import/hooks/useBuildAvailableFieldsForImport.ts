import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

import { AvailableFieldForImport } from '@/object-record/spreadsheet-import/types/AvailableFieldForImport';
import { getSpreadSheetFieldValidationDefinitions } from '@/object-record/spreadsheet-import/utils/getSpreadSheetFieldValidationDefinitions';
import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import { CompositeFieldType } from '@/settings/data-model/types/CompositeFieldType';
import { useIcons } from 'twenty-ui/display';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useBuildAvailableFieldsForImport = () => {
  const { getIcon } = useIcons();

  const buildAvailableFieldsForImport = (
    fieldMetadataItems: FieldMetadataItem[],
  ) => {
    const availableFieldsForImport: AvailableFieldForImport[] = [];

    const createBaseField = (
      fieldMetadataItem: FieldMetadataItem,
      overrides: Partial<AvailableFieldForImport> = {},
      customLabel?: string,
    ): AvailableFieldForImport => ({
      Icon: getIcon(fieldMetadataItem.icon),
      label: customLabel ?? fieldMetadataItem.label,
      key: fieldMetadataItem.name,
      fieldType: { type: 'input' },
      fieldMetadataType: fieldMetadataItem.type,
      fieldValidationDefinitions: getSpreadSheetFieldValidationDefinitions(
        fieldMetadataItem.type,
        customLabel ?? fieldMetadataItem.label,
      ),
      ...overrides,
    });

    const handleCompositeFieldWithLabels = (
      fieldMetadataItem: FieldMetadataItem,
      fieldType: CompositeFieldType,
    ) => {
      SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[fieldType].subFields.forEach(
        ({ subFieldName, subFieldLabel, isImportable }) => {
          if (!isImportable) return;
          const label = `${fieldMetadataItem.label} / ${subFieldLabel}`;

          availableFieldsForImport.push(
            createBaseField(fieldMetadataItem, {
              label,
              key: `${subFieldLabel} (${fieldMetadataItem.name})`,
              fieldValidationDefinitions:
                getSpreadSheetFieldValidationDefinitions(
                  fieldMetadataItem.type,
                  label,
                  subFieldName,
                ),
            }),
          );
        },
      );
    };

    const handleSelectField = (
      fieldMetadataItem: FieldMetadataItem,
      isMulti = false,
    ) => {
      availableFieldsForImport.push(
        createBaseField(fieldMetadataItem, {
          fieldType: {
            type: isMulti ? 'multiSelect' : 'select',
            options:
              fieldMetadataItem.options?.map((option) => ({
                label: option.label,
                value: option.value,
                color: option.color,
              })) || [],
          },
          fieldValidationDefinitions: getSpreadSheetFieldValidationDefinitions(
            fieldMetadataItem.type,
            `${fieldMetadataItem.label} (ID)`,
          ),
        }),
      );
    };

    const fieldTypeHandlers: Record<
      string,
      (fieldMetadataItem: FieldMetadataItem) => void
    > = {
      [FieldMetadataType.FULL_NAME]: (fieldMetadataItem) => {
        handleCompositeFieldWithLabels(
          fieldMetadataItem,
          FieldMetadataType.FULL_NAME,
        );
      },
      [FieldMetadataType.ADDRESS]: (fieldMetadataItem) => {
        handleCompositeFieldWithLabels(
          fieldMetadataItem,
          FieldMetadataType.ADDRESS,
        );
      },
      [FieldMetadataType.LINKS]: (fieldMetadataItem) => {
        handleCompositeFieldWithLabels(
          fieldMetadataItem,
          FieldMetadataType.LINKS,
        );
      },
      [FieldMetadataType.EMAILS]: (fieldMetadataItem) => {
        handleCompositeFieldWithLabels(
          fieldMetadataItem,
          FieldMetadataType.EMAILS,
        );
      },
      [FieldMetadataType.PHONES]: (fieldMetadataItem) => {
        handleCompositeFieldWithLabels(
          fieldMetadataItem,
          FieldMetadataType.PHONES,
        );
      },
      [FieldMetadataType.RICH_TEXT_V2]: (fieldMetadataItem) => {
        handleCompositeFieldWithLabels(
          fieldMetadataItem,
          FieldMetadataType.RICH_TEXT_V2,
        );
      },
      [FieldMetadataType.CURRENCY]: (fieldMetadataItem) => {
        handleCompositeFieldWithLabels(
          fieldMetadataItem,
          FieldMetadataType.CURRENCY,
        );
      },
      [FieldMetadataType.ACTOR]: (fieldMetadataItem) => {
        handleCompositeFieldWithLabels(
          fieldMetadataItem,
          FieldMetadataType.ACTOR,
        );
      },
      [FieldMetadataType.RELATION]: (fieldMetadataItem) => {
        const label = `${fieldMetadataItem.label} (ID)`;
        availableFieldsForImport.push(
          createBaseField(fieldMetadataItem, {
            label,
            fieldValidationDefinitions:
              getSpreadSheetFieldValidationDefinitions(
                fieldMetadataItem.type,
                label,
              ),
          }),
        );
      },
      [FieldMetadataType.SELECT]: (fieldMetadataItem) => {
        handleSelectField(fieldMetadataItem, false);
      },
      [FieldMetadataType.MULTI_SELECT]: (fieldMetadataItem) => {
        handleSelectField(fieldMetadataItem, true);
      },
      [FieldMetadataType.BOOLEAN]: (fieldMetadataItem) => {
        availableFieldsForImport.push(
          createBaseField(fieldMetadataItem, {
            fieldType: { type: 'checkbox' },
          }),
        );
      },

      default: (fieldMetadataItem) => {
        availableFieldsForImport.push(createBaseField(fieldMetadataItem));
      },
    };

    for (const fieldMetadataItem of fieldMetadataItems) {
      const handler =
        fieldTypeHandlers[fieldMetadataItem.type] || fieldTypeHandlers.default;
      handler(fieldMetadataItem);
    }

    return availableFieldsForImport;
  };

  return { buildAvailableFieldsForImport };
};
