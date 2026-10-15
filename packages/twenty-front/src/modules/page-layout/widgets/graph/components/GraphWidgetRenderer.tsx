import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { extractFieldMetadataIdsFromWidget } from '@/page-layout/utils/extractFieldMetadataIdsFromWidget';
import { PageLayoutWidgetNoDataDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetNoDataDisplay';
import { GraphWidget } from '@/page-layout/widgets/graph/components/GraphWidget';
import { GraphWidgetUnavailableFieldsDisplay } from '@/page-layout/widgets/graph/components/GraphWidgetUnavailableFieldsDisplay';
import { getChartFilterFieldMetadataIds } from '@/page-layout/widgets/graph/utils/getChartFilterFieldMetadataIds';
import { getUnavailableChartFields } from '@/page-layout/widgets/graph/utils/getUnavailableChartFields';
import { hasMinimalRequiredConfigForGraph } from '@/page-layout/widgets/graph/utils/hasMinimalRequiredConfigForGraph';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

type GraphWidgetRendererProps = {
  widget: PageLayoutWidget;
};

export const GraphWidgetRenderer = ({ widget }: GraphWidgetRendererProps) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  if (
    !isDefined(widget.configuration) ||
    !isDefined(widget.objectMetadataId) ||
    !hasMinimalRequiredConfigForGraph(widget.configuration)
  ) {
    return <PageLayoutWidgetNoDataDisplay />;
  }

  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.id === widget.objectMetadataId,
  );

  const unavailableFields = isDefined(objectMetadataItem)
    ? getUnavailableChartFields({
        fieldMetadataIds: [
          ...extractFieldMetadataIdsFromWidget(widget),
          ...getChartFilterFieldMetadataIds(widget.configuration),
        ],
        fieldMetadataItems: objectMetadataItem.fields,
      })
    : [];

  if (isNonEmptyArray(unavailableFields)) {
    return (
      <GraphWidgetUnavailableFieldsDisplay
        widgetId={widget.id}
        unavailableFields={unavailableFields}
      />
    );
  }

  return <GraphWidget />;
};
