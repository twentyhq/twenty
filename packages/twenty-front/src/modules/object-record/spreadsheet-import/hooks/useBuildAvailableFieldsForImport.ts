import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

import { COMPOSITE_FIELD_IMPORT_LABELS } from '@/object-record/spreadsheet-import/constants/CompositeFieldImportLabels';
import { AvailableFieldForImport } from '@/object-record/spreadsheet-import/types/AvailableFieldForImport';
import { getSpreadSheetFieldValidationDefinitions } from '@/object-record/spreadsheet-import/utils/getSpreadSheetFieldValidationDefinitions';
import { useIcons } from 'twenty-ui/display';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type CompositeFieldType = keyof typeof COMPOSITE_FIELD_IMPORT_LABELS;

// Helper type for field validation type resolvers
type ValidationTypeResolver = (key: string, label: string) => FieldMetadataType;

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
      validationTypeResolver?: ValidationTypeResolver,
    ) => {
      Object.entries(COMPOSITE_FIELD_IMPORT_LABELS[fieldType]).forEach(
        ([key, subFieldLabel]) => {
          const label = `${fieldMetadataItem.label} / ${subFieldLabel}`;
          // Use the custom validation type if provided, otherwise use the field's type
          const validationType = validationTypeResolver
            ? validationTypeResolver(key, subFieldLabel)
            : fieldMetadataItem.type;

          availableFieldsForImport.push(
            createBaseField(fieldMetadataItem, {
              label,
              key: `${subFieldLabel} (${fieldMetadataItem.name})`,
              fieldValidationDefinitions:
                getSpreadSheetFieldValidationDefinitions(validationType, label),
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

    // Special validation type resolver for currency fields
    const currencyValidationResolver: ValidationTypeResolver = (key) =>
      key === 'amountMicrosLabel'
        ? FieldMetadataType.NUMBER
        : FieldMetadataType.CURRENCY;

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
          currencyValidationResolver,
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
