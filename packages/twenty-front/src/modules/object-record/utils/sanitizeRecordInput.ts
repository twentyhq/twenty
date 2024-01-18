import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { sanitizeRecordLinks } from '@/object-record/utils/sanitizeLinkRecordInput';
import { FieldMetadataType } from '~/generated/graphql';

export const sanitizeRecordInput = ({
  objectMetadataItem,
  recordInput,
}: {
  objectMetadataItem: ObjectMetadataItem;
  recordInput: Record<string, unknown>;
}) => {
  const filteredResultRecord = Object.fromEntries(
    Object.entries(recordInput).filter(([fieldName]) => {
      const fieldDefinition = objectMetadataItem.fields.find(
        (field) => field.name === fieldName,
      );
      return fieldDefinition?.type !== FieldMetadataType.Relation;
    }),
  );
  switch (Object.keys(filteredResultRecord)[0]) {
    case 'domainName':
      return sanitizeRecordLinks(filteredResultRecord);
    default:
      return filteredResultRecord;
  }
};
