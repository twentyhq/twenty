import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { filterFieldsForRecordTableViewCreation } from '@/page-layout/widgets/record-table/utils/filterFieldsForRecordTableViewCreation';
import { sortFieldsByRelevanceForRecordTableWidget } from '@/page-layout/widgets/record-table/utils/sortFieldsByRelevanceForRecordTableWidget';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { usePerformViewAPIPersist } from '@/views/hooks/internal/usePerformViewAPIPersist';
import { usePerformViewFieldAPIPersist } from '@/views/hooks/internal/usePerformViewFieldAPIPersist';
import { useCallback } from 'react';
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
    async (objectMetadataItem: EnrichedObjectMetadataItem) => {
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
        filterFieldsForRecordTableViewCreation,
      );

      const sortedFields = eligibleFields.toSorted(
        sortFieldsByRelevanceForRecordTableWidget(
          objectMetadataItem.labelIdentifierFieldMetadataId,
        ),
      );

      const viewFieldInputs = sortedFields.map((field, index) => ({
        id: v4(),
        viewId: newViewId,
        fieldMetadataId: field.id,
        position: index,
        size: DEFAULT_VIEW_FIELD_SIZE,
        isVisible: index < INITIAL_VISIBLE_FIELDS_COUNT_IN_WIDGET,
      }));

      try {
        await performViewFieldAPICreate({ inputs: viewFieldInputs });

        updateCurrentWidgetConfig({
          configToUpdate: {
            viewId: newViewId,
          },
        });
      } catch (error) {
        throw new Error(
          'Failed to create view fields for record table widget',
          { cause: error },
        );
      }
    },
    [
      performViewAPICreate,
      performViewFieldAPICreate,
      updateCurrentWidgetConfig,
    ],
  );

  return { createViewForRecordTableWidget };
};
