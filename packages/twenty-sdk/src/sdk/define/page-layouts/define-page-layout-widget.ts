import { type StandalonePageLayoutWidgetManifest } from 'twenty-shared/application';

import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { validatePageLayoutWidget } from '@/sdk/define/page-layouts/validate-page-layout-widget';
import { validateStandalonePageLayoutWidgetPlacement } from '@/sdk/define/page-layouts/validate-standalone-page-layout-widget-placement';

export const definePageLayoutWidget: DefineEntity<
  StandalonePageLayoutWidgetManifest
> = (config) => {
  const errors = validatePageLayoutWidget(config);

  errors.push(...validateStandalonePageLayoutWidgetPlacement(config));

  return createValidationResult({ config, errors });
};
