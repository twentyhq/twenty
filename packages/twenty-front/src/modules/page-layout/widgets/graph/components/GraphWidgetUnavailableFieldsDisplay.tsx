import { PageLayoutWidgetStatusDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetStatusDisplay';
import { type UnavailableChartField } from '@/page-layout/widgets/graph/utils/getUnavailableChartFields';
import { plural, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

type GraphWidgetUnavailableFieldsDisplayProps = {
  widgetId: string;
  unavailableFields: UnavailableChartField[];
};

export const GraphWidgetUnavailableFieldsDisplay = ({
  widgetId,
  unavailableFields,
}: GraphWidgetUnavailableFieldsDisplayProps) => {
  const fieldNames = unavailableFields
    .map(({ fieldMetadataItem }) =>
      isDefined(fieldMetadataItem)
        ? `"${fieldMetadataItem.label}"`
        : t`deleted field`,
    )
    .join(', ');

  const tooltipContent = plural(unavailableFields.length, {
    one: `This chart uses a field that is no longer active: ${fieldNames}. Edit the widget to choose another field.`,
    other: `This chart uses fields that are no longer active: ${fieldNames}. Edit the widget to choose other fields.`,
  });

  return (
    <PageLayoutWidgetStatusDisplay
      tooltipId={`widget-unavailable-fields-tooltip-${widgetId}`}
      text={t`Invalid Configuration`}
      tooltipContent={tooltipContent}
    />
  );
};
