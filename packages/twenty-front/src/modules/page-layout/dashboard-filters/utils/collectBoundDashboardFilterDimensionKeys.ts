import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { getDashboardFilterFieldDimensionKey } from '@/page-layout/dashboard-filters/utils/getDashboardFilterFieldDimensionKey';
import { getDashboardFilterRelationTargetDimensionKey } from '@/page-layout/dashboard-filters/utils/getDashboardFilterRelationTargetDimensionKey';
import { type DashboardFilterBinding } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const ID_FIELD_NAME = 'id';

// The dimension keys the existing slots already stand for: a binding through a target field (company -> name)
// filters that target field, a MANY_TO_ONE binding or an own-id binding stands for the relation target too.
export const collectBoundDashboardFilterDimensionKeys = ({
  bindingsByWidgetId,
  objectMetadataItems,
}: {
  bindingsByWidgetId: Record<
    string,
    Record<string, DashboardFilterBinding | null>
  >;
  objectMetadataItems: {
    id: string;
    fields: Pick<
      FieldMetadataItem,
      'id' | 'name' | 'type' | 'options' | 'relation'
    >[];
  }[];
}): Set<string> => {
  const fieldById = new Map(
    objectMetadataItems.flatMap((objectMetadataItem) =>
      objectMetadataItem.fields.map(
        (field) =>
          [
            field.id,
            { field, objectMetadataId: objectMetadataItem.id },
          ] as const,
      ),
    ),
  );

  const boundDimensionKeys = new Set<string>();

  for (const bindings of Object.values(bindingsByWidgetId)) {
    for (const binding of Object.values(bindings)) {
      if (!isDefined(binding)) {
        continue;
      }

      if (isDefined(binding.relationTargetFieldMetadataId)) {
        const relationTargetField = fieldById.get(
          binding.relationTargetFieldMetadataId,
        );

        if (isDefined(relationTargetField)) {
          boundDimensionKeys.add(
            getDashboardFilterFieldDimensionKey(relationTargetField.field),
          );
        }

        continue;
      }

      const boundField = fieldById.get(binding.fieldMetadataId);

      if (!isDefined(boundField)) {
        continue;
      }

      boundDimensionKeys.add(
        getDashboardFilterFieldDimensionKey(boundField.field),
      );

      if (
        boundField.field.name === ID_FIELD_NAME &&
        boundField.field.type === FieldMetadataType.UUID
      ) {
        boundDimensionKeys.add(
          getDashboardFilterRelationTargetDimensionKey(
            boundField.objectMetadataId,
          ),
        );
      }

      if (isManyToOneRelationField(boundField.field)) {
        boundDimensionKeys.add(
          getDashboardFilterRelationTargetDimensionKey(
            boundField.field.relation.targetObjectMetadata.id,
          ),
        );
      }
    }
  }

  return boundDimensionKeys;
};
