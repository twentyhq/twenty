import { FieldMetadataType } from 'twenty-shared/types';

import { type EmailsMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/emails.composite-type';
import { type LinksMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/links.composite-type';
import { type PhonesMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/phones.composite-type';

import { mergeArrayFieldValues } from './merge-array-field-values.util';
import { mergeEmailsFieldValues } from './merge-emails-field-values.util';
import { mergeLinksFieldValues } from './merge-links-field-values.util';
import { mergePhonesFieldValues } from './merge-phones-field-values.util';
import { selectPriorityFieldValue } from './select-priority-field-value.util';

export const mergeFieldValues = (
  fieldType: FieldMetadataType,
  recordsWithValues: { value: unknown; recordId: string }[],
  priorityRecordId: string,
): unknown => {
  switch (fieldType) {
    case FieldMetadataType.ARRAY:
    case FieldMetadataType.MULTI_SELECT:
      return mergeArrayFieldValues(recordsWithValues);

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
      return selectPriorityFieldValue(recordsWithValues, priorityRecordId);
  }
};
