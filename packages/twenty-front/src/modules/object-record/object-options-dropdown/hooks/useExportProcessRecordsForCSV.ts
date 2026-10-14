import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldCurrencyValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import {
  convertCurrencyMicrosToCurrencyAmount,
  isDefined,
  isPlainObject,
} from 'twenty-shared/utils';

const processRecordFieldsForCSVExport = (
  record: ObjectRecord,
  objectMetadataItem: EnrichedObjectMetadataItem,
  objectMetadataItems: EnrichedObjectMetadataItem[],
): ObjectRecord =>
  objectMetadataItem.fields.reduce(
    (processedRecord, field) => {
      if (!isDefined(record[field.name])) {
        return processedRecord;
      }

      switch (field.type) {
        case FieldMetadataType.CURRENCY:
          return {
            ...processedRecord,
            [field.name]: {
              amountMicros: isDefined(record[field.name].amountMicros)
                ? convertCurrencyMicrosToCurrencyAmount(
                    record[field.name].amountMicros,
                  )
                : null,
              currencyCode: record[field.name].currencyCode,
            } satisfies FieldCurrencyValue,
          };
        case FieldMetadataType.MULTI_SELECT:
        case FieldMetadataType.ARRAY:
        case FieldMetadataType.RAW_JSON:
        case FieldMetadataType.FILES:
          return {
            ...processedRecord,
            [field.name]: JSON.stringify(record[field.name]),
          };
        case FieldMetadataType.RELATION: {
          // A related record nested in the row is exported through traversed columns.
          const targetObjectMetadataItem = objectMetadataItems.find(
            (objectMetadataItemToFind) =>
              objectMetadataItemToFind.id ===
              field.relation?.targetObjectMetadata.id,
          );

          if (
            field.relation?.type !== RelationType.MANY_TO_ONE ||
            !isDefined(targetObjectMetadataItem) ||
            !isPlainObject(record[field.name])
          ) {
            return processedRecord;
          }

          return {
            ...processedRecord,
            [field.name]: processRecordFieldsForCSVExport(
              record[field.name],
              targetObjectMetadataItem,
              [],
            ),
          };
        }
        default:
          return processedRecord;
      }
    },
    { ...record },
  );

export const useExportProcessRecordsForCSV = (objectNameSingular: string) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { objectMetadataItems } = useObjectMetadataItems();

  const processRecordsForCSVExport = (records: ObjectRecord[]) =>
    records.map((record) =>
      processRecordFieldsForCSVExport(
        record,
        objectMetadataItem,
        objectMetadataItems,
      ),
    );

  return { processRecordsForCSVExport };
};
