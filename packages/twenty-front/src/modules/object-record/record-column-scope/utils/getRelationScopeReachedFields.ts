import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { findRelationTargetObjectMetadataItem } from '@/related-record-paths/utils/findRelationTargetObjectMetadataItem';
import { type ViewFieldRelationScope } from 'twenty-shared/types';
import { findById, isDefined } from 'twenty-shared/utils';

type RelationScopeReachedField = {
  objectMetadataItem: EnrichedObjectMetadataItem | undefined;
  fieldMetadataId: string;
};

export const getRelationScopeReachedFields = ({
  relationScope,
  relationObjectMetadataItem,
  objectMetadataItems,
}: {
  relationScope: Pick<ViewFieldRelationScope, 'filters' | 'sorts'>;
  relationObjectMetadataItem: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): RelationScopeReachedField[] =>
  [...relationScope.filters, ...relationScope.sorts].flatMap(
    ({ fieldMetadataId, relationTargetFieldMetadataId }) => {
      const relationField: RelationScopeReachedField = {
        objectMetadataItem: relationObjectMetadataItem,
        fieldMetadataId,
      };

      if (!isDefined(relationTargetFieldMetadataId)) {
        return [relationField];
      }

      const relationFieldMetadataItem = relationObjectMetadataItem.fields.find(
        findById(fieldMetadataId),
      );

      return [
        relationField,
        {
          objectMetadataItem: isDefined(relationFieldMetadataItem)
            ? findRelationTargetObjectMetadataItem({
                fieldMetadataItem: relationFieldMetadataItem,
                objectMetadataItems,
              })
            : undefined,
          fieldMetadataId: relationTargetFieldMetadataId,
        },
      ];
    },
  );
