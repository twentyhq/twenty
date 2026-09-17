import { isDefined } from 'twenty-shared/utils';

import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

// The standard application maps mint a fresh id for a record page fields view
// on every call, so a workspace that already holds that view would otherwise
// get a widget pointing at an id nothing in it resolves to.
export const bindFieldsWidgetToExistingView = ({
  flatPageLayoutWidget,
  fieldsWidgetUniversalIdentifier,
  existingFieldsView,
}: {
  flatPageLayoutWidget: FlatPageLayoutWidget;
  fieldsWidgetUniversalIdentifier: string;
  existingFieldsView: Pick<FlatView, 'id'> | undefined;
}): FlatPageLayoutWidget => {
  if (
    !isDefined(existingFieldsView) ||
    flatPageLayoutWidget.universalIdentifier !==
      fieldsWidgetUniversalIdentifier ||
    flatPageLayoutWidget.configuration.configurationType !==
      WidgetConfigurationType.FIELDS
  ) {
    return flatPageLayoutWidget;
  }

  return {
    ...flatPageLayoutWidget,
    configuration: {
      ...flatPageLayoutWidget.configuration,
      viewId: existingFieldsView.id,
    },
  };
};
