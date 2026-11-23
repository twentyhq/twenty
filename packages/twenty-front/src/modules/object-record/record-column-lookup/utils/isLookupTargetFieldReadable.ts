import { type RecordFieldLookupTarget } from '@/object-record/record-column-lookup/types/RecordFieldLookupTarget';
import { findById } from 'twenty-shared/utils';

export const isLookupTargetFieldReadable = ({
  relationObjectMetadataItem,
  lookupTargetFieldMetadataItem,
}: Pick<
  RecordFieldLookupTarget,
  'relationObjectMetadataItem' | 'lookupTargetFieldMetadataItem'
>): boolean =>
  relationObjectMetadataItem.readableFields.some(
    findById(lookupTargetFieldMetadataItem.id),
  );
