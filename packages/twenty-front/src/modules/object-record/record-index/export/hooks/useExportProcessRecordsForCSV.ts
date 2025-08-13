import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type FieldCurrencyValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { convertCurrencyMicrosToCurrencyAmount } from '~/utils/convertCurrencyToCurrencyMicros';

export const useExportProcessRecordsForCSV = (objectNameSingular: string) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const processRecordsForCSVExport = (records: ObjectRecord[]) => {
    return records.map((record) => {
      const currencyFields = objectMetadataItem.fields.filter(
        (field) => field.type === FieldMetadataType.CURRENCY,
      );

      const processedRecord = {
        ...record,
      };

      for (const currencyField of currencyFields) {
        if (isDefined(record[currencyField.name])) {
          processedRecord[currencyField.name] = {
            amountMicros: convertCurrencyMicrosToCurrencyAmount(
              record[currencyField.name].amountMicros,
            ),
            currencyCode: record[currencyField.name].currencyCode,
          } satisfies FieldCurrencyValue;
        }
      }

      return processedRecord;
    });
  };

  return { processRecordsForCSVExport };
};
