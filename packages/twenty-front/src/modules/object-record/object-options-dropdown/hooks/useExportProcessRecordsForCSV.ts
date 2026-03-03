import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { getLabelIdentifierFieldValue } from '@/object-metadata/utils/getLabelIdentifierFieldValue';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { convertCurrencyMicrosToCurrencyAmount } from '~/utils/convertCurrencyToCurrencyMicros';

export const useExportProcessRecordsForCSV = (objectNameSingular: string) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });
  const { objectMetadataItems } = useObjectMetadataItems();

  const processRecordsForCSVExport = (
    records: ObjectRecord[],
    skipRelationFieldNames?: Set<string>,
  ) => {
    return records.map((record) =>
      objectMetadataItem.fields.reduce(
        (processedRecord, field) => {
          if (!isDefined(record[field.name])) {
            return processedRecord;
          }

          switch (field.type) {
            case FieldMetadataType.CURRENCY: {
              const data = record[field.name];
              const amount = convertCurrencyMicrosToCurrencyAmount(
                data?.amountMicros,
              );
              return {
                ...processedRecord,
                [field.name]: {
                  amountMicros: isDefined(amount) ? amount : '',
                  currencyCode: data?.currencyCode ?? '',
                },
              };
            }
            case FieldMetadataType.PHONES:
            case FieldMetadataType.EMAILS:
            case FieldMetadataType.FULL_NAME:
            case FieldMetadataType.LINKS:
            case FieldMetadataType.ADDRESS:
              return processedRecord;
            case FieldMetadataType.RELATION: {
              // Skip relations that are being handled by expanded export
              if (skipRelationFieldNames?.has(field.name) === true) {
                return processedRecord;
              }

              const targetObjectNameSingular =
                field.relation?.targetObjectMetadata?.nameSingular;

              if (!isDefined(targetObjectNameSingular)) {
                return processedRecord;
              }

              const targetObjectMetadataItem = objectMetadataItems.find(
                (item) => item.nameSingular === targetObjectNameSingular,
              );

              if (!isDefined(targetObjectMetadataItem)) {
                return processedRecord;
              }

              const labelIdentifierField = getLabelIdentifierFieldMetadataItem(
                targetObjectMetadataItem,
              );

              const displayValue = getLabelIdentifierFieldValue(
                record[field.name],
                labelIdentifierField,
              );

              return {
                ...processedRecord,
                [field.name]: displayValue,
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
