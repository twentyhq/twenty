import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { usePerformViewAPIPersist } from '@/views/hooks/internal/usePerformViewAPIPersist';
import { usePerformViewFieldAPIPersist } from '@/views/hooks/internal/usePerformViewFieldAPIPersist';
import { useCallback } from 'react';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { v4 } from 'uuid';
import { ViewType } from '~/generated-metadata/graphql';

const DEFAULT_VIEW_FIELD_SIZE = 180;
const INITIAL_VISIBLE_FIELDS_COUNT_IN_WIDGET = 6;

export const useCreateViewForRecordTableWidget = (pageLayoutId: string) => {
  const { performViewAPICreate } = usePerformViewAPIPersist();
  const { performViewFieldAPICreate } = usePerformViewFieldAPIPersist();
  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const createViewForRecordTableWidget = useCallback(
    async (objectMetadataItem: ObjectMetadataItem) => {
      const newViewId = v4();

      const viewResult = await performViewAPICreate(
        {
          input: {
            id: newViewId,
            name: `${objectMetadataItem.labelPlural} Table`,
            icon: objectMetadataItem.icon ?? 'IconTable',
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
          field.isActive && !field.isSystem && !isHiddenSystemField(field),
      );

      const isRelationReverseSide = (field: (typeof eligibleFields)[number]) =>
        field.type === FieldMetadataType.RELATION &&
        field.settings?.relationType === RelationType.ONE_TO_MANY;

      const isLabelIdentifier = (field: (typeof eligibleFields)[number]) =>
        field.id === objectMetadataItem.labelIdentifierFieldMetadataId;

      const sortedFields = eligibleFields.toSorted((fieldA, fieldB) => {
        if (isLabelIdentifier(fieldA)) return -1;
        if (isLabelIdentifier(fieldB)) return 1;

        const isFieldAReverse = isRelationReverseSide(fieldA);
        const isFieldBReverse = isRelationReverseSide(fieldB);

        if (isFieldAReverse && !isFieldBReverse) return 1;
        if (!isFieldAReverse && isFieldBReverse) return -1;

        const isFieldARelation = fieldA.type === FieldMetadataType.RELATION;
        const isFieldBRelation = fieldB.type === FieldMetadataType.RELATION;

        if (isFieldARelation && !isFieldBRelation) return 1;
        if (!isFieldARelation && isFieldBRelation) return -1;

        return 0;
      });

      const viewFieldInputs = sortedFields.map((field, index) => ({
        id: v4(),
        viewId: newViewId,
        fieldMetadataId: field.id,
        position: index,
        size: DEFAULT_VIEW_FIELD_SIZE,
        isVisible: index < INITIAL_VISIBLE_FIELDS_COUNT_IN_WIDGET,
      }));

      await performViewFieldAPICreate({ inputs: viewFieldInputs });

      updateCurrentWidgetConfig({
        configToUpdate: {
          viewId: newViewId,
        },
      });
    },
    [
      performViewAPICreate,
      performViewFieldAPICreate,
      updateCurrentWidgetConfig,
    ],
  );

  return { createViewForRecordTableWidget };
};
