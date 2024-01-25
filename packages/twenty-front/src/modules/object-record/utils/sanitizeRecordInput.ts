import { isString } from '@sniptt/guards';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { sanitizeLink } from '@/object-record/utils/sanitizeLinkRecordInput';
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
  if (
    objectMetadataItem.nameSingular !== CoreObjectNameSingular.Company ||
    !isString(filteredResultRecord.domainName)
  )
    return filteredResultRecord;

  return {
    ...filteredResultRecord,
    domainName: sanitizeLink(filteredResultRecord.domainName),
  };
};
