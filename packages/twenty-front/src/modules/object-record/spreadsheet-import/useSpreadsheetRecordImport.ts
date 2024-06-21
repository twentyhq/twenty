import { isNonEmptyString } from '@sniptt/guards';
import { IconComponent, useIcons } from 'twenty-ui';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { getSpreadSheetValidation } from '@/object-record/spreadsheet-import/util/getSpreadSheetValidation';
import { useSpreadsheetImport } from '@/spreadsheet-import/hooks/useSpreadsheetImport';
import { SpreadsheetOptions, Validation } from '@/spreadsheet-import/types';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';

const firstName = 'Firstname';
const lastName = 'Lastname';

export const useSpreadsheetRecordImport = (objectNameSingular: string) => {
  const { openSpreadsheetImport } = useSpreadsheetImport<any>();
  const { enqueueSnackBar } = useSnackBar();
  const { getIcon } = useIcons();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });
  const fields = objectMetadataItem.fields
    .filter(
      (x) =>
        x.isActive &&
        (!x.isSystem || x.name === 'id') &&
        x.name !== 'createdAt' &&
        (x.type !== FieldMetadataType.Relation || x.toRelationMetadata),
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const templateFields: {
    icon: IconComponent;
    label: string;
    key: string;
    fieldType: {
      type: 'input' | 'checkbox';
    };
    validations?: Validation[];
  }[] = [];
  for (const field of fields) {
    if (field.type === FieldMetadataType.FullName) {
      templateFields.push({
        icon: getIcon(field.icon),
        label: `${firstName} (${field.label})`,
        key: `${firstName} (${field.name})`,
        fieldType: {
          type: 'input',
        },
        validations: getSpreadSheetValidation(
          field.type,
          `${firstName} (${field.label})`,
        ),
      });
      templateFields.push({
        icon: getIcon(field.icon),
        label: `${lastName} (${field.label})`,
        key: `${lastName} (${field.name})`,
        fieldType: {
          type: 'input',
        },
        validations: getSpreadSheetValidation(
          field.type,
          `${lastName} (${field.label})`,
        ),
      });
    } else if (field.type === FieldMetadataType.Relation) {
      templateFields.push({
        icon: getIcon(field.icon),
        label: field.label + ' (ID)',
        key: field.name,
        fieldType: {
          type: 'input',
        },
        validations: getSpreadSheetValidation(
          field.type,
          field.label + ' (ID)',
        ),
      });
    } else {
      templateFields.push({
        icon: getIcon(field.icon),
        label: field.label,
        key: field.name,
        fieldType: {
          type: 'input',
        },
        validations: getSpreadSheetValidation(field.type, field.label),
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
                if (value !== undefined) {
                  fieldMapping[field.name] = value === 'true' || value === true;
                }
                break;
              case FieldMetadataType.Number:
              case FieldMetadataType.Numeric:
                if (value !== undefined) {
                  fieldMapping[field.name] = Number(value);
                }
                break;
              case FieldMetadataType.Currency:
                if (value !== undefined) {
                  fieldMapping[field.name] = {
                    amountMicros: Number(value),
                    currencyCode: 'USD',
                  };
                }
                break;
              case FieldMetadataType.Link:
                if (value !== undefined) {
                  fieldMapping[field.name] = {
                    label: field.name,
                    url: value || null,
                  };
                }
                break;
              case FieldMetadataType.Relation:
                if (
                  isDefined(value) &&
                  (isNonEmptyString(value) || value !== false)
                ) {
                  fieldMapping[field.name + 'Id'] = value;
                }
                break;
              case FieldMetadataType.FullName:
                if (
                  isDefined(
                    record[`${firstName} (${field.name})`] ||
                      record[`${lastName} (${field.name})`],
                  )
                ) {
                  fieldMapping[field.name] = {
                    firstName: record[`${firstName} (${field.name})`] || '',
                    lastName: record[`${lastName} (${field.name})`] || '',
                  };
                }
                break;
              default:
                if (value !== undefined) {
                  fieldMapping[field.name] = value;
                }
                break;
            }
          }
          return fieldMapping;
        });
        try {
          await createManyRecords(createInputs, true);
        } catch (error: any) {
          enqueueSnackBar(error?.message || 'Something went wrong', {
            variant: SnackBarVariant.Error,
          });
        }
      },
      fields: templateFields,
    });
  };

  return { openRecordSpreadsheetImport };
};
