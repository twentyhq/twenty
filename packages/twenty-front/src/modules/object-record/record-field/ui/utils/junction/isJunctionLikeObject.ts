import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getFieldRelations } from '@/object-record/record-field/ui/utils/junction/getFieldRelations';
import { RelationType } from '~/generated-metadata/graphql';

export const isJunctionLikeObject = (
  fields: Pick<
    FieldMetadataItem,
    'isSystem' | 'isSystemSideEffect' | 'relation' | 'morphRelations'
  >[],
) =>
  fields.every(
    (field) =>
      field.isSystem === true ||
      field.isSystemSideEffect === true ||
      getFieldRelations(field).every(
        ({ type }) => type === RelationType.MANY_TO_ONE,
      ),
  );
