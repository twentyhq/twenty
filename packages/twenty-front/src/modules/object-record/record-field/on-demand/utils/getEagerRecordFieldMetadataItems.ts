import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getIsOnDemandFieldEnabled } from '@/object-record/record-field/on-demand/utils/getIsOnDemandFieldEnabled';
import { filterDuplicatesById } from 'twenty-shared/utils';

export const getEagerRecordFieldMetadataItems = <
  TFieldMetadata extends Pick<FieldMetadataItem, 'id' | 'type' | 'settings'>,
>({
  visibleFieldMetadataItems,
  requiredFieldMetadataItems,
  isOnDemandFieldsEnabled,
}: {
  visibleFieldMetadataItems: TFieldMetadata[];
  requiredFieldMetadataItems: TFieldMetadata[];
  isOnDemandFieldsEnabled: boolean;
}): TFieldMetadata[] =>
  [
    ...visibleFieldMetadataItems.filter(
      (fieldMetadataItem) =>
        !getIsOnDemandFieldEnabled({
          isOnDemandFieldsEnabled,
          fieldMetadataItem,
        }),
    ),
    ...requiredFieldMetadataItems,
  ].filter(filterDuplicatesById);
