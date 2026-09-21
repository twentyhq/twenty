import { type StandalonePageLayoutWidgetManifest } from 'twenty-shared/application';

import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { validatePageLayoutWidget } from '@/sdk/define/page-layouts/validate-page-layout-widget';

export const definePageLayoutWidget: DefineEntity<
  StandalonePageLayoutWidgetManifest
> = (config) => {
  const errors = validatePageLayoutWidget(config);

  if (!config.pageLayoutTabUniversalIdentifier) {
    errors.push(
      'PageLayoutWidget must have a pageLayoutTabUniversalIdentifier when defined standalone (use the universalIdentifier of the tab it is added to)',
    );
  }

  if (!config.position) {
    errors.push(
      'PageLayoutWidget must have a position when defined standalone (its tab is not in the manifest, so the layout mode cannot be inferred)',
    );
  }

  return createValidationResult({ config, errors });
};
