import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { type WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';

export const validateStandaloneRichTextBody = ({
  standaloneRichTextUniversalConfiguration,
  widgetTitle,
}: {
  standaloneRichTextUniversalConfiguration: UniversalFlatPageLayoutWidget<WidgetConfigurationType.STANDALONE_RICH_TEXT>['universalConfiguration'];
  widgetTitle: string;
}): FlatPageLayoutWidgetValidationError[] => {
  const errors: FlatPageLayoutWidgetValidationError[] = [];

  if (!isDefined(standaloneRichTextUniversalConfiguration.body)) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Body is required for standalone rich text widget "${widgetTitle}"`,
      userFriendlyMessage: msg`Body is required for standalone rich text widget`,
    });

    return errors;
  }

  if (
    typeof standaloneRichTextUniversalConfiguration.body !== 'object' ||
    Array.isArray(standaloneRichTextUniversalConfiguration.body)
  ) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Body must be an object for widget "${widgetTitle}"`,
      userFriendlyMessage: msg`Body must be an object`,
      value: standaloneRichTextUniversalConfiguration.body,
    });
  }

  return errors;
};
