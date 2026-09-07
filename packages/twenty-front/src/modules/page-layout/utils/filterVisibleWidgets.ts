import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type WidgetVisibilityContext } from '@/page-layout/types/WidgetVisibilityContext';
import { evaluateWidgetVisibility } from '@/page-layout/utils/evaluateWidgetVisibility';
import { isFieldWidget } from '@/page-layout/widgets/field/utils/isFieldWidget';

type FilterVisibleWidgetsParams = {
  widgets: PageLayoutTab['widgets'];
  context: WidgetVisibilityContext;
};

export const filterVisibleWidgets = ({
  widgets,
  context,
}: FilterVisibleWidgetsParams): PageLayoutTab['widgets'] => {
  const hiddenFieldMetadataIdsOrNames =
    context.hiddenFieldMetadataIdsOrNames ?? [];

  return widgets.filter((widget) => {
    if (
      isFieldWidget(widget) &&
      hiddenFieldMetadataIdsOrNames.includes(
        widget.configuration.fieldMetadataId,
      )
    ) {
      return false;
    }

    return evaluateWidgetVisibility({
      conditionalAvailabilityExpression:
        widget.conditionalAvailabilityExpression,
      conditionalDisplay: widget.conditionalDisplay,
      context,
    });
  });
};
