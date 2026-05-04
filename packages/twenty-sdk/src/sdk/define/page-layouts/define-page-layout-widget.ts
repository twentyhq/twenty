import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { type PageLayoutWidgetConfig } from '@/sdk/define/page-layouts/page-layout-widget-config';

// Defines a page-layout widget as a top-level entity. Use this when you want
// to declare widgets independently from their parent tab, or to add widgets to
// a tab declared in another app. For widgets that travel with their tab, the
// `widgets:` array on `definePageLayout` / `definePageLayoutTab` is simpler —
// don't declare the same widget both ways.
export const definePageLayoutWidget: DefineEntity<PageLayoutWidgetConfig> = (
  config,
) => {
  const errors: string[] = [];

  if (!config.universalIdentifier) {
    errors.push('PageLayoutWidget must have a universalIdentifier');
  }

  if (!config.title) {
    errors.push('PageLayoutWidget must have a title');
  }

  if (!config.type) {
    errors.push('PageLayoutWidget must have a type');
  }

  if (!config.pageLayoutTabUniversalIdentifier) {
    errors.push(
      'PageLayoutWidget must have a pageLayoutTabUniversalIdentifier when defined standalone (use the parent page layout tab universalIdentifier)',
    );
  }

  return createValidationResult({ config, errors });
};
