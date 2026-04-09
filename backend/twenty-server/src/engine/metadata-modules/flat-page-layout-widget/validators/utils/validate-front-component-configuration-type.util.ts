import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';

export const validateFrontComponentConfigurationType = ({
  universalConfiguration,
  title,
}: Pick<
  UniversalFlatPageLayoutWidget,
  'universalConfiguration' | 'title'
>): FlatPageLayoutWidgetValidationError[] => {
  const errors: FlatPageLayoutWidgetValidationError[] = [];

  if (!isDefined(universalConfiguration.configurationType)) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Configuration type is required for widget "${title}"`,
      userFriendlyMessage: msg`Configuration type is required`,
    });

    return errors;
  }

  if (
    universalConfiguration.configurationType !==
    WidgetConfigurationType.FRONT_COMPONENT
  ) {
    const configurationTypeString = String(
      universalConfiguration.configurationType,
    );

    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Invalid configuration type for front component widget "${title}". Expected FRONT_COMPONENT, got ${configurationTypeString}`,
      userFriendlyMessage: msg`Invalid configuration type for front component widget`,
      value: universalConfiguration.configurationType,
    });
  }

  return errors;
};
