import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { usePerformViewAPIPersist } from '@/views/hooks/internal/usePerformViewAPIPersist';
import { usePerformViewFieldAPIPersist } from '@/views/hooks/internal/usePerformViewFieldAPIPersist';
import { useCallback } from 'react';
import { v4 } from 'uuid';
import { ViewType } from '~/generated-metadata/graphql';

const DEFAULT_VIEW_FIELD_SIZE = 180;

const pendingViewCreations = new Set<string>();

// TODO: This runtime fallback logic is temporary
// System views will later be created declaratively in the database during twenty standard app installation.
export const useCreateDefaultViewForObject = () => {
  const { performViewAPICreate } = usePerformViewAPIPersist();
  const { performViewFieldAPICreate } = usePerformViewFieldAPIPersist();

  const createDefaultViewForObject = useCallback(
    async (objectMetadataItem: EnrichedObjectMetadataItem) => {
      if (pendingViewCreations.has(objectMetadataItem.id)) {
        return;
      }

      pendingViewCreations.add(objectMetadataItem.id);

      try {
        const newViewId = v4();

        const viewResult = await performViewAPICreate(
          {
            input: {
              id: newViewId,
              name: `All ${objectMetadataItem.labelPlural}`,
              icon: objectMetadataItem.icon ?? 'IconList',
              objectMetadataId: objectMetadataItem.id,
              type: ViewType.TABLE,
            },
          },
          objectMetadataItem.id,
        );

        if (viewResult.status !== 'successful') {
          return;
        }

        const eligibleFields = objectMetadataItem.fields.filter(
          (field) =>
            field.isActive &&
            !isHiddenSystemField(field) &&
            field.name !== 'deletedAt',
        );

        const sortedFields = eligibleFields.toSorted((fieldA, fieldB) => {
          const isFieldALabelIdentifier =
            fieldA.id === objectMetadataItem.labelIdentifierFieldMetadataId;
          const isFieldBLabelIdentifier =
            fieldB.id === objectMetadataItem.labelIdentifierFieldMetadataId;

          if (isFieldALabelIdentifier) return -1;
          if (isFieldBLabelIdentifier) return 1;

          return 0;
        });

        const viewFieldInputs = sortedFields.map((field, index) => ({
          id: v4(),
          viewId: newViewId,
          fieldMetadataId: field.id,
          position: index,
          size: DEFAULT_VIEW_FIELD_SIZE,
          isVisible: true,
        }));

        await performViewFieldAPICreate({ inputs: viewFieldInputs });
      } finally {
        pendingViewCreations.delete(objectMetadataItem.id);
      }
    },
    [performViewAPICreate, performViewFieldAPICreate],
  );

  return {
    createDefaultViewForObject,
  };
};
