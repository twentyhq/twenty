import { isValidPhoneNumber } from 'libphonenumber-js';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { useSpreadsheetImport } from '@/spreadsheet-import/hooks/useSpreadsheetImport';
import { SpreadsheetOptions, Validation } from '@/spreadsheet-import/types';
import { useIcons } from '@/ui/display/icon/hooks/useIcons';
import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const firstName = ' Firstname';
const lastName = ' Lastname';

const getValidation = (
  type: FieldMetadataType,
  fieldName: string,
): Validation[] => {
  switch (type) {
    case FieldMetadataType.Number:
      return [
        {
          rule: 'regex',
          value: '^d+$',
          errorMessage: fieldName + ' must be a number',
          level: 'error',
        },
      ];
    case FieldMetadataType.Phone:
      return [
        {
          rule: 'function',
          isValid: (value: string) => isValidPhoneNumber(value),
          errorMessage: fieldName + ' is not valid',
          level: 'error',
        },
      ];
    default:
      return [];
  }
};

export const useSpreadsheetRecordImport = (objectNameSingular: string) => {
  const { openSpreadsheetImport } = useSpreadsheetImport<any>();
  const { enqueueSnackBar } = useSnackBar();
  const { getIcon } = useIcons();

  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });
  const fields = objectMetadataItem.fields
    .filter(
      (x) =>
        x.isActive &&
        !x.isSystem &&
        x.type !== FieldMetadataType.Relation &&
        x.name !== 'createdAt',
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const templateFields: {
    icon: IconComponent;
    label: string;
    key: string;
    fieldType: {
      type: 'input' | 'checkbox';
    };
    example?: string;
    validations?: Validation[];
  }[] = [];
  for (const field of objectMetadataItem.fields) {
    if (
      !field.isActive ||
      field.isSystem ||
      field.type === FieldMetadataType.Relation ||
      field.name === 'createdAt'
    ) {
      continue;
    }
    if (field.type === FieldMetadataType.FullName) {
      templateFields.push({
        icon: getIcon(field.icon),
        label: field.label + firstName,
        key: field.name + firstName,
        fieldType: {
          type: 'input',
        },
        validations: getValidation(field.type, field.name),
      });
      templateFields.push({
        icon: getIcon(field.icon),
        label: field.label + lastName,
        key: field.name + lastName,
        fieldType: {
          type: 'input',
        },
        validations: getValidation(field.type, field.name),
      });
    } else {
      templateFields.push({
        icon: getIcon(field.icon),
        label: field.label,
        key: field.name,
        fieldType: {
          type: 'input',
        },
        example: field.defaultValue as string,
        validations: getValidation(field.type, field.name),
      });
    }
  }

  const { createManyRecords } = useCreateManyRecords({
    objectNameSingular,
  });

  const openRecordSpreadsheetImport = (
    options?: Omit<SpreadsheetOptions<any>, 'fields' | 'isOpen' | 'onClose'>,
  ) => {
    openSpreadsheetImport({
      ...options,
      onSubmit: async (data) => {
        const createInputs = data.validData.map((record) => {
          const fieldMapping: Record<string, any> = {};
          for (const field of fields) {
            const value = record[field.name];

            switch (field.type) {
              case FieldMetadataType.Boolean:
                fieldMapping[field.name] = value === 'true' || value === true;
                break;
              case FieldMetadataType.Number:
              case FieldMetadataType.Numeric:
                fieldMapping[field.name] = Number(value);
                break;
              case FieldMetadataType.Currency:
                fieldMapping[field.name] = {
                  amountMicros: value !== undefined ? Number(value) : null,
                  currencyCode: 'USD',
                };
                break;
              case FieldMetadataType.Link:
                fieldMapping[field.name] = {
                  label: field.name,
                  url: value || null,
                };
                break;
              case FieldMetadataType.FullName:
                fieldMapping[field.name] = {
                  firstName: record[field.name + firstName] || '',
                  lastName: record[field.name + lastName] || '',
                };
                break;
              default:
                fieldMapping[field.name] = value;
                break;
            }
          }
          return fieldMapping;
        });
        try {
          await createManyRecords(createInputs);
        } catch (error: any) {
          enqueueSnackBar(error?.message || 'Something went wrong', {
            variant: 'error',
          });
        }
      },
      fields: templateFields,
    });
  };

  return { openRecordSpreadsheetImport };
};
