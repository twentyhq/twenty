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
      if (fieldMetadataItem.type === FieldMetadataType.FullName) {
        const { firstNameLabel, lastNameLabel } =
          COMPOSITE_FIELD_IMPORT_LABELS[FieldMetadataType.FullName];

        availableFieldsForImport.push({
          icon: getIcon(fieldMetadataItem.icon),
          label: `${firstNameLabel} (${fieldMetadataItem.label})`,
          key: `${firstNameLabel} (${fieldMetadataItem.name})`,
          fieldType: {
            type: 'input',
          },
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
          fieldValidationDefinitions: getSpreadSheetFieldValidationDefinitions(
            fieldMetadataItem.type,
            `${lastNameLabel} (${fieldMetadataItem.label})`,
          ),
        });
      } else if (fieldMetadataItem.type === FieldMetadataType.Relation) {
        availableFieldsForImport.push({
          icon: getIcon(fieldMetadataItem.icon),
          label: fieldMetadataItem.label + ' (ID)',
          key: fieldMetadataItem.name,
          fieldType: {
            type: 'input',
          },
          fieldValidationDefinitions: getSpreadSheetFieldValidationDefinitions(
            fieldMetadataItem.type,
            fieldMetadataItem.label + ' (ID)',
          ),
        });
      } else if (fieldMetadataItem.type === FieldMetadataType.Currency) {
        const { currencyCodeLabel, amountMicrosLabel } =
          COMPOSITE_FIELD_IMPORT_LABELS[FieldMetadataType.Currency];

        availableFieldsForImport.push({
          icon: getIcon(fieldMetadataItem.icon),
          label: `${currencyCodeLabel} (${fieldMetadataItem.label})`,
          key: `${currencyCodeLabel} (${fieldMetadataItem.name})`,
          fieldType: {
            type: 'input',
          },
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
          fieldValidationDefinitions: getSpreadSheetFieldValidationDefinitions(
            FieldMetadataType.Number,
            `${amountMicrosLabel} (${fieldMetadataItem.label})`,
          ),
        });
      } else if (fieldMetadataItem.type === FieldMetadataType.Address) {
        Object.entries(
          COMPOSITE_FIELD_IMPORT_LABELS[FieldMetadataType.Address],
        ).forEach(([_, fieldLabel]) => {
          availableFieldsForImport.push({
            icon: getIcon(fieldMetadataItem.icon),
            label: `${fieldLabel} (${fieldMetadataItem.label})`,
            key: `${fieldLabel} (${fieldMetadataItem.name})`,
            fieldType: {
              type: 'input',
            },
            fieldValidationDefinitions:
              getSpreadSheetFieldValidationDefinitions(
                fieldMetadataItem.type,
                `${fieldLabel} (${fieldMetadataItem.label})`,
              ),
          });
        });
      } else if (fieldMetadataItem.type === FieldMetadataType.Links) {
        Object.entries(
          COMPOSITE_FIELD_IMPORT_LABELS[FieldMetadataType.Links],
        ).forEach(([_, fieldLabel]) => {
          availableFieldsForImport.push({
            icon: getIcon(fieldMetadataItem.icon),
            label: `${fieldLabel} (${fieldMetadataItem.label})`,
            key: `${fieldLabel} (${fieldMetadataItem.name})`,
            fieldType: {
              type: 'input',
            },
            fieldValidationDefinitions:
              getSpreadSheetFieldValidationDefinitions(
                fieldMetadataItem.type,
                `${fieldLabel} (${fieldMetadataItem.label})`,
              ),
          });
        });
      } else if (fieldMetadataItem.type === FieldMetadataType.Select) {
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
          fieldValidationDefinitions: getSpreadSheetFieldValidationDefinitions(
            fieldMetadataItem.type,
            fieldMetadataItem.label + ' (ID)',
          ),
        });
      } else if (fieldMetadataItem.type === FieldMetadataType.MultiSelect) {
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
          fieldValidationDefinitions: getSpreadSheetFieldValidationDefinitions(
            fieldMetadataItem.type,
            fieldMetadataItem.label + ' (ID)',
          ),
        });
      } else if (fieldMetadataItem.type === FieldMetadataType.Boolean) {
        availableFieldsForImport.push({
          icon: getIcon(fieldMetadataItem.icon),
          label: fieldMetadataItem.label,
          key: fieldMetadataItem.name,
          fieldType: {
            type: 'checkbox',
          },
          fieldValidationDefinitions: getSpreadSheetFieldValidationDefinitions(
            fieldMetadataItem.type,
            fieldMetadataItem.label,
          ),
        });
      } else if (fieldMetadataItem.type === FieldMetadataType.Emails) {
        Object.entries(
          COMPOSITE_FIELD_IMPORT_LABELS[FieldMetadataType.Emails],
        ).forEach(([_, fieldLabel]) => {
          availableFieldsForImport.push({
            icon: getIcon(fieldMetadataItem.icon),
            label: `${fieldLabel} (${fieldMetadataItem.label})`,
            key: `${fieldLabel} (${fieldMetadataItem.name})`,
            fieldType: {
              type: 'input',
            },
            fieldValidationDefinitions:
              getSpreadSheetFieldValidationDefinitions(
                fieldMetadataItem.type,
                `${fieldLabel} (${fieldMetadataItem.label})`,
              ),
          });
        });
      } else if (fieldMetadataItem.type === FieldMetadataType.Phones) {
        Object.entries(
          COMPOSITE_FIELD_IMPORT_LABELS[FieldMetadataType.Phones],
        ).forEach(([_, fieldLabel]) => {
          availableFieldsForImport.push({
            icon: getIcon(fieldMetadataItem.icon),
            label: `${fieldLabel} (${fieldMetadataItem.label})`,
            key: `${fieldLabel} (${fieldMetadataItem.name})`,
            fieldType: {
              type: 'input',
            },
            fieldValidationDefinitions:
              getSpreadSheetFieldValidationDefinitions(
                fieldMetadataItem.type,
                `${fieldLabel} (${fieldMetadataItem.label})`,
              ),
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
