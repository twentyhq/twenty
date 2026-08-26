import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { isConfiguredJunctionRelationField } from '@/object-record/record-field/ui/utils/junction/isConfiguredJunctionRelationField';

type IsFieldMetadataAvailableForViewFieldArgs = {
  fieldMetadata: Pick<
    FieldMetadataItem,
    'name' | 'isSystem' | 'isActive' | 'type' | 'settings'
  >;
};

export const isActiveFieldMetadataItem = ({
  fieldMetadata,
}: IsFieldMetadataAvailableForViewFieldArgs) => {
  if (fieldMetadata.isActive === false) {
    return false;
  }

  // A junction relation is a system field that must stay visible, since it is the only
  // way to reach the records it links to.
  if (isConfiguredJunctionRelationField(fieldMetadata)) {
    return true;
  }

  if (isHiddenSystemField(fieldMetadata)) {
    return false;
  }

  return true;
};
