import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type JunctionObjectMetadataItem } from '@/object-record/record-field/ui/utils/junction/types/JunctionObjectMetadataItem';

export type ValidJunctionConfig = {
  junctionObjectMetadata: JunctionObjectMetadataItem;
  targetFields: FieldMetadataItem[];
  sourceField?: FieldMetadataItem;
  isMorphRelation: boolean;
  isValid: true;
};
