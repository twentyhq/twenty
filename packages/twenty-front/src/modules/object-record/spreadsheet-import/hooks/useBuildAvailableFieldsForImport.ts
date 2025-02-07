import { useIcons } from 'twenty-ui';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

import { COMPOSITE_FIELD_IMPORT_LABELS } from '@/object-record/spreadsheet-import/constants/CompositeFieldImportLabels';
import { AvailableFieldForImport } from '@/object-record/spreadsheet-import/types/AvailableFieldForImport';
import { getSpreadSheetFieldValidationDefinitions } from '@/object-record/spreadsheet-import/utils/getSpreadSheetFieldValidationDefinitions';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useBuildAvailableFieldsForImport = () => {
  const { getIcon } = useIcons();

  const buildAvailableFieldsForImport = (
    fieldMetadataItems: FieldMetadataItem[],
  ) => {
    const availableFieldsForImport: AvailableFieldForImport[] = [];

    // Todo: refactor this to avoid this else if syntax with duplicated code
    for (const fieldMetadataItem of fieldMetadataItems) {
      if (fieldMetadataItem.type === FieldMetadataType.FULL_NAME) {
        const { firstNameLabel, lastNameLabel } =
          COMPOSITE_FIELD_IMPORT_LABELS[FieldMetadataType.FULL_NAME];

        availableFieldsForImport.push({
          icon: getIcon(fieldMetadataItem.icon),
          label: `${firstNameLabel} (${fieldMetadataItem.label})`,
          key: `${firstNameLabel} (${fieldMetadataItem.name})`,
          fieldType: {
            type: 'input',
          },
          fieldMetadataType: fieldMetadataItem.type,
          fieldValidationDefinitions: getSpreadSheetFieldValidationDefinitions(
            fieldMetadataItem.type,
            `${firstNameLabel} (${fieldMetadataItem.label})`,
          ),
        });

        availableFieldsForImport.push({
          icon: getIcon(fieldMetadataItem.icon),
          label: `${lastNameLabel} (${fieldMetadataItem.label})`,
          key: `${lastNameLabel} (${fieldMetadataItem.name})`,
          fieldType: {
            type: 'input',
          },
          fieldMetadataType: fieldMetadataItem.type,
          fieldValidationDefinitions: getSpreadSheetFieldValidationDefinitions(
            fieldMetadataItem.type,
            `${lastNameLabel} (${fieldMetadataItem.label})`,
          ),
        });
      } else if (fieldMetadataItem.type === FieldMetadataType.RELATION) {
        availableFieldsForImport.push({
          icon: getIcon(fieldMetadataItem.icon),
          label: fieldMetadataItem.label + ' (ID)',
          key: fieldMetadataItem.name,
          fieldType: {
            type: 'input',
          },
          fieldMetadataType: fieldMetadataItem.type,
          fieldValidationDefinitions: getSpreadSheetFieldValidationDefinitions(
            fieldMetadataItem.type,
            fieldMetadataItem.label + ' (ID)',
          ),
        });
      } else if (fieldMetadataItem.type === FieldMetadataType.CURRENCY) {
        const { currencyCodeLabel, amountMicrosLabel } =
          COMPOSITE_FIELD_IMPORT_LABELS[FieldMetadataType.CURRENCY];

        availableFieldsForImport.push({
          icon: getIcon(fieldMetadataItem.icon),
          label: `${currencyCodeLabel} (${fieldMetadataItem.label})`,
          key: `${currencyCodeLabel} (${fieldMetadataItem.name})`,
          fieldType: {
            type: 'input',
          },
          fieldMetadataType: fieldMetadataItem.type,
          fieldValidationDefinitions: getSpreadSheetFieldValidationDefinitions(
            fieldMetadataItem.type,
            `${currencyCodeLabel} (${fieldMetadataItem.label})`,
          ),
        });

        availableFieldsForImport.push({
          icon: getIcon(fieldMetadataItem.icon),
          label: `${amountMicrosLabel} (${fieldMetadataItem.label})`,
          key: `${amountMicrosLabel} (${fieldMetadataItem.name})`,
          fieldType: {
            type: 'input',
          },
          fieldMetadataType: fieldMetadataItem.type,
          fieldValidationDefinitions: getSpreadSheetFieldValidationDefinitions(
            FieldMetadataType.NUMBER,
            `${amountMicrosLabel} (${fieldMetadataItem.label})`,
          ),
        });
      } else if (fieldMetadataItem.type === FieldMetadataType.ADDRESS) {
        Object.entries(
          COMPOSITE_FIELD_IMPORT_LABELS[FieldMetadataType.ADDRESS],
        ).forEach(([_, fieldLabel]) => {
          availableFieldsForImport.push({
            icon: getIcon(fieldMetadataItem.icon),
            label: `${fieldLabel} (${fieldMetadataItem.label})`,
            key: `${fieldLabel} (${fieldMetadataItem.name})`,
            fieldType: {
              type: 'input',
            },
            fieldMetadataType: fieldMetadataItem.type,
            fieldValidationDefinitions:
              getSpreadSheetFieldValidationDefinitions(
                fieldMetadataItem.type,
                `${fieldLabel} (${fieldMetadataItem.label})`,
              ),
          });
        });
      } else if (fieldMetadataItem.type === FieldMetadataType.LINKS) {
        Object.entries(
          COMPOSITE_FIELD_IMPORT_LABELS[FieldMetadataType.LINKS],
        ).forEach(([_, fieldLabel]) => {
          availableFieldsForImport.push({
            icon: getIcon(fieldMetadataItem.icon),
            label: `${fieldLabel} (${fieldMetadataItem.label})`,
            key: `${fieldLabel} (${fieldMetadataItem.name})`,
            fieldType: {
              type: 'input',
            },
            fieldMetadataType: fieldMetadataItem.type,
            fieldValidationDefinitions:
              getSpreadSheetFieldValidationDefinitions(
                fieldMetadataItem.type,
                `${fieldLabel} (${fieldMetadataItem.label})`,
              ),
          });
        });
      } else if (fieldMetadataItem.type === FieldMetadataType.SELECT) {
        availableFieldsForImport.push({
          icon: getIcon(fieldMetadataItem.icon),
          label: fieldMetadataItem.label,
          key: fieldMetadataItem.name,
          fieldType: {
            type: 'select',
            options:
              fieldMetadataItem.options?.map((option) => ({
                label: option.label,
                value: option.value,
                color: option.color,
              })) || [],
          },
          fieldMetadataType: fieldMetadataItem.type,
          fieldValidationDefinitions: getSpreadSheetFieldValidationDefinitions(
            fieldMetadataItem.type,
            fieldMetadataItem.label + ' (ID)',
          ),
        });
      } else if (fieldMetadataItem.type === FieldMetadataType.MULTI_SELECT) {
        availableFieldsForImport.push({
          icon: getIcon(fieldMetadataItem.icon),
          label: fieldMetadataItem.label,
          key: fieldMetadataItem.name,
          fieldType: {
            type: 'multiSelect',
            options:
              fieldMetadataItem.options?.map((option) => ({
                label: option.label,
                value: option.value,
                color: option.color,
              })) || [],
          },
          fieldMetadataType: fieldMetadataItem.type,
          fieldValidationDefinitions: getSpreadSheetFieldValidationDefinitions(
            fieldMetadataItem.type,
            fieldMetadataItem.label + ' (ID)',
          ),
        });
      } else if (fieldMetadataItem.type === FieldMetadataType.BOOLEAN) {
        availableFieldsForImport.push({
          icon: getIcon(fieldMetadataItem.icon),
          label: fieldMetadataItem.label,
          key: fieldMetadataItem.name,
          fieldType: {
            type: 'checkbox',
          },
          fieldMetadataType: fieldMetadataItem.type,
          fieldValidationDefinitions: getSpreadSheetFieldValidationDefinitions(
            fieldMetadataItem.type,
            fieldMetadataItem.label,
          ),
        });
      } else if (fieldMetadataItem.type === FieldMetadataType.EMAILS) {
        Object.entries(
          COMPOSITE_FIELD_IMPORT_LABELS[FieldMetadataType.EMAILS],
        ).forEach(([_, fieldLabel]) => {
          availableFieldsForImport.push({
            icon: getIcon(fieldMetadataItem.icon),
            label: `${fieldLabel} (${fieldMetadataItem.label})`,
            key: `${fieldLabel} (${fieldMetadataItem.name})`,
            fieldType: {
              type: 'input',
            },
            fieldMetadataType: fieldMetadataItem.type,
            fieldValidationDefinitions:
              getSpreadSheetFieldValidationDefinitions(
                fieldMetadataItem.type,
                `${fieldLabel} (${fieldMetadataItem.label})`,
              ),
          });
        });
      } else if (fieldMetadataItem.type === FieldMetadataType.PHONES) {
        Object.entries(
          COMPOSITE_FIELD_IMPORT_LABELS[FieldMetadataType.PHONES],
        ).forEach(([_, fieldLabel]) => {
          availableFieldsForImport.push({
            icon: getIcon(fieldMetadataItem.icon),
            label: `${fieldLabel} (${fieldMetadataItem.label})`,
            key: `${fieldLabel} (${fieldMetadataItem.name})`,
            fieldType: {
              type: 'input',
            },
            fieldMetadataType: fieldMetadataItem.type,
            fieldValidationDefinitions:
              getSpreadSheetFieldValidationDefinitions(
                fieldMetadataItem.type,
                `${fieldLabel} (${fieldMetadataItem.label})`,
              ),
          });
        });
      } else if (fieldMetadataItem.type === FieldMetadataType.RICH_TEXT_V2) {
        Object.entries(
          COMPOSITE_FIELD_IMPORT_LABELS[FieldMetadataType.RICH_TEXT_V2],
        ).forEach(([_, fieldLabel]) => {
          availableFieldsForImport.push({
            icon: getIcon(fieldMetadataItem.icon),
            label: `${fieldLabel} (${fieldMetadataItem.label})`,
            key: `${fieldLabel} (${fieldMetadataItem.name})`,
            fieldType: {
              type: 'input',
            },
            fieldMetadataType: fieldMetadataItem.type,
          });
        });
      } else {
        availableFieldsForImport.push({
          icon: getIcon(fieldMetadataItem.icon),
          label: fieldMetadataItem.label,
          key: fieldMetadataItem.name,
          fieldType: {
            type: 'input',
          },
          fieldMetadataType: fieldMetadataItem.type,
          fieldValidationDefinitions: getSpreadSheetFieldValidationDefinitions(
            fieldMetadataItem.type,
            fieldMetadataItem.label,
          ),
        });
      }
    }

    return availableFieldsForImport;
  };

  return { buildAvailableFieldsForImport };
};
