import {
  FieldMetadataType,
  type EmailsMetadata,
  type LinksMetadata,
  type PhonesMetadata,
  type RelationType,
} from 'twenty-shared/types';

import { mergeArrayFieldValues } from './merge-array-field-values.util';
import { mergeEmailsFieldValues } from './merge-emails-field-values.util';
import { mergeLinksFieldValues } from './merge-links-field-values.util';
import { mergePhonesFieldValues } from './merge-phones-field-values.util';
import { mergeRelationFieldValuesForDryRunRecord } from './merge-relation-field-values-for-dry-run-record.util';
import { defaultMergeFieldValue } from './default-merge-field-value.util';

export const mergeFieldValues = (
  fieldType: FieldMetadataType,
  recordsWithValues: { value: unknown; recordId: string }[],
  priorityRecordId: string,
  isDryRun = false,
  relationType?: RelationType,
): unknown => {
  switch (fieldType) {
    case FieldMetadataType.ARRAY:
    case FieldMetadataType.MULTI_SELECT:
      return mergeArrayFieldValues(recordsWithValues);

    case FieldMetadataType.RELATION:
      if (isDryRun) {
        return mergeRelationFieldValuesForDryRunRecord(
          recordsWithValues,
          relationType,
          priorityRecordId,
        );
      }

      return defaultMergeFieldValue(recordsWithValues, priorityRecordId);

    case FieldMetadataType.EMAILS:
      return mergeEmailsFieldValues(
        recordsWithValues as { value: EmailsMetadata; recordId: string }[],
        priorityRecordId,
      );

    case FieldMetadataType.PHONES:
      return mergePhonesFieldValues(
        recordsWithValues as { value: PhonesMetadata; recordId: string }[],
        priorityRecordId,
      );

    case FieldMetadataType.LINKS:
      return mergeLinksFieldValues(
        recordsWithValues as { value: LinksMetadata; recordId: string }[],
        priorityRecordId,
      );

    default:
      return defaultMergeFieldValue(recordsWithValues, priorityRecordId);
  }
};
