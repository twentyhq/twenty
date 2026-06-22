import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

export const isManyToOneRelationToWorkspaceMember = (
  field: Pick<FieldMetadataItem, 'type' | 'relation'>,
): boolean =>
  field.type === FieldMetadataType.RELATION &&
  field.relation?.type === RelationType.MANY_TO_ONE &&
  field.relation.targetObjectMetadata.nameSingular ===
    CoreObjectNameSingular.WorkspaceMember;
