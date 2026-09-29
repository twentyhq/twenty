import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type FieldCurrencyValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { convertCurrencyMicrosToCurrencyAmount } from '~/utils/convertCurrencyToCurrencyMicros';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useExportProcessRecordsForCSV = (objectNameSingular: string) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const processRecordsForCSVExport = (records: ObjectRecord[]) => {
    return records.map((record) =>
      objectMetadataItem.fields.reduce(
        (processedRecord, field) => {
          if (!isDefined(record[field.name])) {
            return processedRecord;
          }

          switch (field.type) {
            case FieldMetadataType.CURRENCY: {
              const amountMicros = record[field.name].amountMicros;

              return {
                ...processedRecord,
                [field.name]: {
                  // Preserve empty amounts instead of coercing null to 0
                  amountMicros: isUndefinedOrNull(amountMicros)
                    ? null
                    : convertCurrencyMicrosToCurrencyAmount(amountMicros),
                  currencyCode: record[field.name].currencyCode,
                } satisfies FieldCurrencyValue,
              };
            }
            case FieldMetadataType.MULTI_SELECT:
            case FieldMetadataType.ARRAY:
            case FieldMetadataType.RAW_JSON:
            case FieldMetadataType.FILES:
              return {
                ...processedRecord,
                [field.name]: JSON.stringify(record[field.name]),
              };
            default:
              return processedRecord;
          }
        },
        { ...record },
      ),
    );
  };

  return { processRecordsForCSVExport };
};
