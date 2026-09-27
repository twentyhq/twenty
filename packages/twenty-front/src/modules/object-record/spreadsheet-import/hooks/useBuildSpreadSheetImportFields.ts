import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import {
  type FieldMetadataItem,
  type FieldMetadataItemOption,
} from '@/object-metadata/types/FieldMetadataItem';
import { getSpreadsheetImportValidationMessageText } from '@/object-record/spreadsheet-import/utils/getSpreadsheetImportValidationMessageText';
import { type SpreadsheetImportFields } from '@/spreadsheet-import/types';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { buildSpreadsheetImportFields } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';

export const useBuildSpreadsheetImportFields = () => {
  const { getIcon } = useIcons();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const buildSpreadsheetImportFieldsWithIcons = (
    fieldMetadataItems: FieldMetadataItem[],
  ): SpreadsheetImportFields => {
    const fieldMetadataItemById = new Map(
      fieldMetadataItems.map((fieldMetadataItem) => [
        fieldMetadataItem.id,
        fieldMetadataItem,
      ]),
    );

    return buildSpreadsheetImportFields({
      fieldMetadataItems,
      objectMetadataItems,
    }).map(({ fieldValidationDefinitions, fieldType, ...field }) => {
      const fieldMetadataItem = fieldMetadataItemById.get(
        field.fieldMetadataItemId,
      );

      return {
        ...field,
        Icon: getIcon(fieldMetadataItem?.icon),
        fieldType:
          fieldType.type === 'select' || fieldType.type === 'multiSelect'
            ? {
                type: fieldType.type,
                // Options are copied from field metadata, whose colors are theme colors
                options: fieldType.options.map(({ label, value, color }) => ({
                  label,
                  value,
                  color: color as FieldMetadataItemOption['color'],
                })),
              }
            : fieldType,
        fieldValidationDefinitions: fieldValidationDefinitions.map(
          (fieldValidationDefinition) => ({
            ...fieldValidationDefinition,
            errorMessage: getSpreadsheetImportValidationMessageText(
              fieldValidationDefinition.errorMessage,
            ),
          }),
        ),
      };
    });
  };

  return {
    buildSpreadsheetImportFields: buildSpreadsheetImportFieldsWithIcons,
  };
};
